import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Verify access
    const { data: nexus, error: nexusError } = await supabase
      .from('nexuses')
      .select('id, title, description, created_by, visibility')
      .eq('id', params.id)
      .single();

    if (nexusError || !nexus) {
      return NextResponse.json({ error: 'Nexus not found.' }, { status: 404 });
    }

    const isOwner = nexus.created_by === session.userId;
    if (!isOwner) {
      const { data: sub } = await supabase
        .from('nexus_subscriptions')
        .select('id')
        .eq('nexus_id', params.id)
        .eq('user_id', session.userId)
        .maybeSingle();

      if (!sub && nexus.visibility !== 'link') {
        return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
      }
    }

    // Fetch all graph data for this nexus in parallel
    const [nodesRes, subjectsRes, progressRes] = await Promise.all([
      supabase
        .from('nodes')
        .select('*, subject:subjects(*)')
        .eq('nexus_id', params.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('subjects')
        .select('*')
        .eq('nexus_id', params.id)
        .order('name', { ascending: true }),
      supabase
        .from('user_node_progress')
        .select('*')
        .eq('user_id', session.userId),
    ]);

    const nodes = nodesRes.data || [];
    const nodeIds = nodes.map((n) => n.id);

    // Fetch edges and prerequisites scoped to this nexus's nodes
    const [edgesRes, prereqRes] = await Promise.all([
      nodeIds.length > 0
        ? supabase
            .from('edges')
            .select('*')
            .in('source_node_id', nodeIds)
            .in('target_node_id', nodeIds)
        : Promise.resolve({ data: [] }),
      nodeIds.length > 0
        ? supabase
            .from('prerequisites')
            .select('*')
            .in('node_id', nodeIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Build progress map scoped to nexus nodes
    const nodeIdSet = new Set(nodeIds);
    const progressMap: Record<string, unknown> = {};
    for (const p of progressRes.data || []) {
      if (nodeIdSet.has(p.node_id)) {
        progressMap[p.node_id] = p;
      }
    }

    return NextResponse.json({
      nexus,
      isOwner,
      nodes,
      subjects: subjectsRes.data || [],
      edges: edgesRes.data || [],
      prerequisites: prereqRes.data || [],
      progress: progressMap,
    });
  } catch (error) {
    console.error('GET /api/nexuses/[id]/graph error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
