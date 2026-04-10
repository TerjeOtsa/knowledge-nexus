import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

/**
 * GET /api/notes?node_id=X  — Get the user's note for a specific node
 * GET /api/notes              — Get ALL notes for the user (master notes)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const nodeId = request.nextUrl.searchParams.get('node_id');

    if (nodeId) {
      // Single note for this node
      const { data: note } = await supabase
        .from('user_node_notes')
        .select('*')
        .eq('user_id', session.userId)
        .eq('node_id', nodeId)
        .single();

      return NextResponse.json({ note: note || null });
    }

    // All notes for master note compilation
    const { data: rawNotes, error } = await supabase
      .from('user_node_notes')
      .select('*, node:nodes(id, title, slug, subject_id, subject:subjects(name, color))')
      .eq('user_id', session.userId)
      .neq('content', '')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Fetch notes error:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    // Flatten the nested Supabase join into the MasterNoteEntry shape
    // so the client gets { node_id, node_title, subject_name, subject_color, content, updated_at }
    const notes = (rawNotes || []).map((row: Record<string, unknown>) => {
      const node = row.node as Record<string, unknown> | null;
      const subject = node?.subject as Record<string, unknown> | null;
      return {
        node_id: row.node_id,
        node_title: node?.title ?? 'Unknown Node',
        subject_name: subject?.name ?? null,
        subject_color: subject?.color ?? null,
        content: row.content,
        updated_at: row.updated_at,
      };
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/notes — Create or update a note for a node (upsert)
 * Body: { node_id, content }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { node_id, content } = await request.json();

    if (!node_id) {
      return NextResponse.json({ error: 'node_id is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: note, error } = await supabase
      .from('user_node_notes')
      .upsert(
        {
          user_id: session.userId,
          node_id,
          content: content || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,node_id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Save note error:', error);
      return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Save note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
