import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { generateContentPackFromSource, prepareSourceDocument } from '@/lib/content-pack-generation';
import { summarizeContentPack } from '@/lib/content-pack';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { url?: string; documentText?: string };
    const source = await prepareSourceDocument(body);

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

    const pack = await generateContentPackFromSource({
      source,
      existingSubjects: (subjects || []).map((subject) => ({
        name: subject.name,
        description: subject.description,
      })),
      existingNodes: (nodes || []).map((node) => ({
        slug: node.slug,
        title: node.title,
        subject_name: Array.isArray(node.subject) ? node.subject[0]?.name : (node.subject as { name?: string } | null)?.name,
      })),
    });

    return NextResponse.json({
      pack,
      summary: summarizeContentPack(pack),
      source,
    });
  } catch (error) {
    console.error('Generate content pack error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
