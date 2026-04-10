import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { createEdgeSchema } from '@/lib/validations';

/**
 * GET /api/edges - Fetch all edges
 */
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: edges, error } = await supabase
      .from('edges')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch edges error:', error);
      return NextResponse.json({ error: 'Failed to fetch edges' }, { status: 500 });
    }

    return NextResponse.json({ edges: edges || [] });
  } catch (error) {
    console.error('Fetch edges error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/edges - Create a new edge
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createEdgeSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;

    // Prevent self-loops
    if (data.source_node_id === data.target_node_id) {
      return NextResponse.json({ error: 'Cannot create edge from a node to itself' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check for duplicate edge
    const { data: existing } = await supabase
      .from('edges')
      .select('id')
      .eq('source_node_id', data.source_node_id)
      .eq('target_node_id', data.target_node_id)
      .eq('relationship_type', data.relationship_type)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This connection already exists' }, { status: 409 });
    }

    const { data: edge, error } = await supabase
      .from('edges')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Create edge error:', error);
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }

    return NextResponse.json({ edge }, { status: 201 });
  } catch (error) {
    console.error('Create edge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/edges - Delete an edge by id (passed as query param)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const edgeId = request.nextUrl.searchParams.get('id');
    if (!edgeId) {
      return NextResponse.json({ error: 'Edge ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase.from('edges').delete().eq('id', edgeId);

    if (error) {
      console.error('Delete edge error:', error);
      return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete edge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
