import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { createNodeSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';

/**
 * GET /api/nodes - Fetch all nodes with their subjects
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get('subject_id');

    let query = supabase
      .from('nodes')
      .select('*, subject:subjects(*)');

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data: nodes, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch nodes error:', error);
      return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
    }

    return NextResponse.json({ nodes: nodes || [] });
  } catch (error) {
    console.error('Fetch nodes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/nodes - Create a new node
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createNodeSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;
    const supabase = createServerClient();

    // Generate unique slug
    let slug = slugify(data.title);
    const { data: existingSlugs } = await supabase
      .from('nodes')
      .select('slug')
      .like('slug', `${slug}%`);

    if (existingSlugs && existingSlugs.length > 0) {
      slug = `${slug}-${existingSlugs.length}`;
    }

    const { data: node, error } = await supabase
      .from('nodes')
      .insert({
        ...data,
        slug,
        created_by: session.userId,
      })
      .select('*, subject:subjects(*)')
      .single();

    if (error) {
      console.error('Create node error:', error);
      return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
    }

    return NextResponse.json({ node }, { status: 201 });
  } catch (error) {
    console.error('Create node error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
