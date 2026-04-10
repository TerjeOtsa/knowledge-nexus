import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { createTestSchema } from '@/lib/validations';

/**
 * GET /api/tests?node_id=xxx - Get mastery test for a node
 */
export async function GET(request: NextRequest) {
  try {
    const nodeId = request.nextUrl.searchParams.get('node_id');
    if (!nodeId) {
      return NextResponse.json({ error: 'node_id is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: test, error } = await supabase
      .from('mastery_tests')
      .select('*, questions:mastery_questions(*, options:mastery_question_options(*))')
      .eq('node_id', nodeId)
      .order('order_index', { referencedTable: 'mastery_questions', ascending: true })
      .single();

    if (error || !test) {
      return NextResponse.json({ error: 'No test found for this node' }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error) {
    console.error('Fetch test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tests - Create a mastery test with questions and options
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createTestSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { questions, ...testData } = validation.data;
    const supabase = createServerClient();

    // Create the test
    const { data: test, error: testError } = await supabase
      .from('mastery_tests')
      .insert(testData)
      .select('*')
      .single();

    if (testError || !test) {
      console.error('Create test error:', testError);
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    // Create questions with options
    for (const question of questions) {
      const { options, ...questionData } = question;

      const { data: createdQuestion, error: qError } = await supabase
        .from('mastery_questions')
        .insert({ ...questionData, mastery_test_id: test.id })
        .select('*')
        .single();

      if (qError || !createdQuestion) {
        console.error('Create question error:', qError);
        continue;
      }

      // Create options if any
      if (options && options.length > 0) {
        const optionsWithQuestionId = options.map((opt) => ({
          ...opt,
          question_id: createdQuestion.id,
        }));

        const { error: optError } = await supabase
          .from('mastery_question_options')
          .insert(optionsWithQuestionId);

        if (optError) {
          console.error('Create options error:', optError);
        }
      }
    }

    // Fetch the complete test with questions
    const { data: completeTest } = await supabase
      .from('mastery_tests')
      .select('*, questions:mastery_questions(*, options:mastery_question_options(*))')
      .eq('id', test.id)
      .order('order_index', { referencedTable: 'mastery_questions', ascending: true })
      .single();

    return NextResponse.json({ test: completeTest }, { status: 201 });
  } catch (error) {
    console.error('Create test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
