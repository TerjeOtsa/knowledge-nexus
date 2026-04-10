import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

/**
 * GET /api/dashboard - Get dashboard stats for the current user
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Fetch all nodes with subjects
    const { data: allNodes } = await supabase
      .from('nodes')
      .select('*, subject:subjects(*)');

    // Fetch user progress
    const { data: progress } = await supabase
      .from('user_node_progress')
      .select('*')
      .eq('user_id', session.userId);

    // Fetch recent attempts
    const { data: recentAttempts } = await supabase
      .from('mastery_attempts')
      .select('*, node:nodes(id, title, slug)')
      .eq('user_id', session.userId)
      .order('submitted_at', { ascending: false })
      .limit(10);

    // Fetch all subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*');

    // Fetch edges for recommendation logic
    const { data: edges } = await supabase
      .from('edges')
      .select('*');

    // Fetch prerequisites
    const { data: prerequisites } = await supabase
      .from('prerequisites')
      .select('*');

    const nodes = allNodes || [];
    const progressList = progress || [];
    const subjectsList = subjects || [];
    const edgesList = edges || [];
    const prereqsList = prerequisites || [];

    // Build progress map
    const progressMap: Record<string, typeof progressList[0]> = {};
    progressList.forEach((p) => {
      progressMap[p.node_id] = p;
    });

    // Calculate counts
    const masteredCount = progressList.filter((p) => p.status === 'mastered').length;
    const inProgressCount = progressList.filter((p) => p.status === 'in_progress').length;
    const totalNodes = nodes.length;
    const untouchedCount = totalNodes - masteredCount - inProgressCount;
    const completionPercentage = totalNodes > 0 ? Math.round((masteredCount / totalNodes) * 100) : 0;

    // Subject progress
    const subjectProgress = subjectsList.map((subject) => {
      const subjectNodes = nodes.filter((n) => n.subject_id === subject.id);
      const subjectMastered = subjectNodes.filter((n) => progressMap[n.id]?.status === 'mastered').length;
      const subjectInProgress = subjectNodes.filter((n) => progressMap[n.id]?.status === 'in_progress').length;
      return {
        subject,
        total: subjectNodes.length,
        mastered: subjectMastered,
        in_progress: subjectInProgress,
        percentage: subjectNodes.length > 0 ? Math.round((subjectMastered / subjectNodes.length) * 100) : 0,
      };
    });

    // Recent activity
    const recentActivity = (recentAttempts || []).map((attempt) => ({
      node: attempt.node,
      action: attempt.passed ? 'mastered' as const : 'attempted' as const,
      timestamp: attempt.submitted_at,
    }));

    // Recommendation logic:
    // Find nodes whose prerequisites are all mastered and that haven't been mastered yet
    const masteredNodeIds = new Set(
      progressList.filter((p) => p.status === 'mastered').map((p) => p.node_id)
    );

    const recommendedNodes = nodes.filter((node) => {
      // Skip already mastered nodes
      if (masteredNodeIds.has(node.id)) return false;

      // Find prerequisites for this node
      const nodePrereqs = prereqsList.filter((p) => p.node_id === node.id);

      // If no prerequisites, recommend it if connected to something mastered
      if (nodePrereqs.length === 0) {
        // Check if connected to mastered nodes
        const connectedToMastered = edgesList.some(
          (e) =>
            (e.source_node_id === node.id && masteredNodeIds.has(e.target_node_id)) ||
            (e.target_node_id === node.id && masteredNodeIds.has(e.source_node_id))
        );
        // Also recommend untouched unconnected nodes (they're good starting points)
        return connectedToMastered || !progressMap[node.id];
      }

      // All prerequisites must be mastered
      return nodePrereqs.every((p) => masteredNodeIds.has(p.prerequisite_node_id));
    }).slice(0, 5);

    return NextResponse.json({
      stats: {
        total_nodes: totalNodes,
        mastered_count: masteredCount,
        in_progress_count: inProgressCount,
        untouched_count: untouchedCount,
        completion_percentage: completionPercentage,
        subjects: subjectProgress,
        recent_activity: recentActivity,
        recommended_nodes: recommendedNodes,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
