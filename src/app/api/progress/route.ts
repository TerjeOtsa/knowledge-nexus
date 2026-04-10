import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

/**
 * GET /api/progress - Fetch user's progress on all nodes
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data: progress, error } = await supabase
      .from('user_node_progress')
      .select('*')
      .eq('user_id', session.userId);

    if (error) {
      console.error('Fetch progress error:', error);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    // Convert to a record keyed by node_id
    const progressMap: Record<string, typeof progress[0]> = {};
    (progress || []).forEach((p) => {
      progressMap[p.node_id] = p;
    });

    return NextResponse.json({ progress: progressMap });
  } catch (error) {
    console.error('Fetch progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/progress - Update progress for a specific node
 * Body: { node_id, status?, latest_score? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { node_id, status, latest_score } = body;

    if (!node_id) {
      return NextResponse.json({ error: 'node_id is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if progress record exists
    const { data: existing } = await supabase
      .from('user_node_progress')
      .select('*')
      .eq('user_id', session.userId)
      .eq('node_id', node_id)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing progress
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (latest_score !== undefined) updates.latest_score = latest_score;
      if (status === 'mastered') updates.mastered_at = now;
      if (status === 'in_progress' && existing.status === 'untouched') {
        updates.first_interacted_at = now;
      }

      const { data: progress, error } = await supabase
        .from('user_node_progress')
        .update(updates)
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error) {
        console.error('Update progress error:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
      }

      return NextResponse.json({ progress });
    } else {
      // Create new progress record
      const newProgress = {
        user_id: session.userId,
        node_id,
        status: status || 'in_progress',
        first_interacted_at: now,
        mastered_at: status === 'mastered' ? now : null,
        latest_score: latest_score ?? null,
        attempt_count: 0,
      };

      const { data: progress, error } = await supabase
        .from('user_node_progress')
        .insert(newProgress)
        .select('*')
        .single();

      if (error) {
        console.error('Create progress error:', error);
        return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 });
      }

      return NextResponse.json({ progress }, { status: 201 });
    }
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
