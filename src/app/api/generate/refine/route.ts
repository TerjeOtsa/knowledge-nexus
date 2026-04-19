import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { generateRefinedContentPack, prepareSourceDocument } from '@/lib/content-pack-generation';
import { contentPackSchema, summarizeContentPack } from '@/lib/content-pack';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      url?: string;
      documentText?: string;
      previousPack?: unknown;
      feedback?: string;
    };

    if (!body.feedback?.trim()) {
      return NextResponse.json({ error: 'Feedback is required for refinement.' }, { status: 400 });
    }

    const parsedPack = contentPackSchema.safeParse(body.previousPack);
    if (!parsedPack.success) {
      return NextResponse.json({ error: 'Invalid content pack provided for refinement.' }, { status: 400 });
    }

    const source = await prepareSourceDocument({ url: body.url, documentText: body.documentText });

    const supabase = createServerClient();
    const [{ data: subjects, error: subjectError }, { data: nodes, error: nodeError }] = await Promise.all([
      supabase
        .from('subjects')
        .select('name, description')
        .order('name', { ascending: true }),
      supabase
        .from('nodes')
        .select('slug, title, subject:subjects(name)')
        .order('created_at', { ascending: true }),
    ]);

    if (subjectError) {
      throw new Error(`Failed to load existing subjects: ${subjectError.message}`);
    }
    if (nodeError) {
      throw new Error(`Failed to load existing nodes: ${nodeError.message}`);
    }

    const pack = await generateRefinedContentPack({
      source,
      previousPack: parsedPack.data,
      feedback: body.feedback.trim(),
      existingSubjects: (subjects || []).map((s) => ({
        name: s.name,
        description: s.description,
      })),
      existingNodes: (nodes || []).map((n) => ({
        slug: n.slug,
        title: n.title,
        subject_name: Array.isArray(n.subject)
          ? n.subject[0]?.name
          : (n.subject as { name?: string } | null)?.name,
      })),
    });

    return NextResponse.json({
      pack,
      summary: summarizeContentPack(pack),
      source,
    });
  } catch (error) {
    console.error('Refine content pack error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
