import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Own nexuses with node/subject counts via RPC or subquery
    const { data: nexuses, error } = await supabase
      .from('nexuses')
      .select(`
        id,
        title,
        description,
        created_by,
        visibility,
        created_at,
        updated_at
      `)
      .eq('created_by', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach node + subject counts
    const nexusIds = (nexuses || []).map((n) => n.id);
    const counts: Record<string, { node_count: number; subject_count: number }> = {};

    if (nexusIds.length > 0) {
      const [{ data: nodeCounts }, { data: subjectCounts }] = await Promise.all([
        supabase
          .from('nodes')
          .select('nexus_id')
          .in('nexus_id', nexusIds),
        supabase
          .from('subjects')
          .select('nexus_id')
          .in('nexus_id', nexusIds),
      ]);

      for (const n of nexusIds) {
        counts[n] = {
          node_count: (nodeCounts || []).filter((r) => r.nexus_id === n).length,
          subject_count: (subjectCounts || []).filter((r) => r.nexus_id === n).length,
        };
      }
    }

    return NextResponse.json({
      nexuses: (nexuses || []).map((n) => ({
        ...n,
        node_count: counts[n.id]?.node_count ?? 0,
        subject_count: counts[n.id]?.subject_count ?? 0,
      })),
    });
  } catch (error) {
    console.error('GET /api/nexuses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { title?: string; description?: string; visibility?: string };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: nexus, error } = await supabase
      .from('nexuses')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        created_by: session.userId,
        visibility: body.visibility === 'link' ? 'link' : 'private',
      })
      .select('*')
      .single();

    if (error || !nexus) {
      return NextResponse.json({ error: error?.message || 'Failed to create nexus.' }, { status: 500 });
    }

    return NextResponse.json({ nexus }, { status: 201 });
  } catch (error) {
    console.error('POST /api/nexuses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
