import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { updateNodeSchema } from '@/lib/validations';

/**
 * GET /api/nodes/[id] - Get a single node with all related data
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // Fetch node with subject
    const { data: node, error } = await supabase
      .from('nodes')
      .select('*, subject:subjects(*)')
      .eq('id', id)
      .single();

    if (error || !node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    // Fetch connected edges
    const { data: outgoingEdges } = await supabase
      .from('edges')
      .select('*, target_node:nodes!edges_target_node_id_fkey(id, title, slug)')
      .eq('source_node_id', id);

    const { data: incomingEdges } = await supabase
      .from('edges')
      .select('*, source_node:nodes!edges_source_node_id_fkey(id, title, slug)')
      .eq('target_node_id', id);

    // Fetch prerequisites
    const { data: prerequisites } = await supabase
      .from('prerequisites')
      .select('*, prerequisite_node:nodes!prerequisites_prerequisite_node_id_fkey(id, title, slug)')
      .eq('node_id', id);

    // Fetch dependent nodes (nodes that have this as prerequisite)
    const { data: dependents } = await supabase
      .from('prerequisites')
      .select('*, dependent_node:nodes!prerequisites_node_id_fkey(id, title, slug)')
      .eq('prerequisite_node_id', id);

    // Fetch mastery test
    const { data: masteryTest } = await supabase
      .from('mastery_tests')
      .select('*, questions:mastery_questions(*, options:mastery_question_options(*))')
      .eq('node_id', id)
      .order('order_index', { referencedTable: 'mastery_questions', ascending: true })
      .single();

    return NextResponse.json({
      node,
      outgoingEdges: outgoingEdges || [],
      incomingEdges: incomingEdges || [],
      prerequisites: prerequisites || [],
      dependents: dependents || [],
      masteryTest,
    });
  } catch (error) {
    console.error('Fetch node error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/nodes/[id] - Update a node
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateNodeSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: node, error } = await supabase
      .from('nodes')
      .update(validation.data)
      .eq('id', id)
      .select('*, subject:subjects(*)')
      .single();

    if (error) {
      console.error('Update node error:', error);
      return NextResponse.json({ error: 'Failed to update node' }, { status: 500 });
    }

    return NextResponse.json({ node });
  } catch (error) {
    console.error('Update node error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/nodes/[id] - Delete a node
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();
    const { error } = await supabase.from('nodes').delete().eq('id', id);

    if (error) {
      console.error('Delete node error:', error);
      return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete node error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
