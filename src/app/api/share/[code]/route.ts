import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } },
) {
  try {
    const code = params.code?.toUpperCase().trim();
    if (!code) {
      return NextResponse.json({ error: 'Code is required.' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: shareCode, error } = await supabase
      .from('share_codes')
      .select('code, label, node_id')
      .eq('code', code)
      .single();

    if (error || !shareCode) {
      return NextResponse.json({ error: 'Share code not found.' }, { status: 404 });
    }

    if (!shareCode.node_id) {
      return NextResponse.json({ error: 'Invalid share code target.' }, { status: 400 });
    }

    const { data: node, error: nodeError } = await supabase
      .from('nodes')
      .select(`
        id,
        title,
        slug,
        topic,
        description,
        why_it_matters,
        use_cases,
        difficulty,
        subject:subjects(id, name, color, icon)
      `)
      .eq('id', shareCode.node_id)
      .single();

    if (nodeError || !node) {
      return NextResponse.json({ error: 'The shared node no longer exists.' }, { status: 404 });
    }

    // Also fetch mastery test info (just metadata, not questions — test content requires auth)
    const { data: test } = await supabase
      .from('mastery_tests')
      .select('id, title, passing_score, questions:mastery_questions(id)')
      .eq('node_id', shareCode.node_id)
      .maybeSingle();

    return NextResponse.json({
      code: shareCode.code,
      label: shareCode.label,
      node: {
        ...node,
        subject: Array.isArray(node.subject) ? node.subject[0] : node.subject,
      },
      test: test
        ? {
            id: test.id,
            title: test.title,
            passing_score: test.passing_score,
            question_count: Array.isArray(test.questions) ? test.questions.length : 0,
          }
        : null,
    });
  } catch (error) {
    console.error('Share code resolve error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
