import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { testSubmissionSchema } from '@/lib/validations';

/**
 * POST /api/tests/submit - Submit answers for a mastery test
 * 
 * Grading logic:
 * - For multiple_choice and applied_scenario: check if selected option is_correct
 * - For short_answer: check if answer matches any correct option (case-insensitive)
 * - Calculate percentage score
 * - If score >= passing_score, mark node as mastered
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = testSubmissionSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { test_id, node_id, answers } = validation.data;
    const supabase = createServerClient();

    // Fetch test with questions and options
    const { data: test, error: testError } = await supabase
      .from('mastery_tests')
      .select('*, questions:mastery_questions(*, options:mastery_question_options(*))')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const questions = test.questions || [];
    let correctCount = 0;
    const feedback: Array<{
      question_id: string;
      correct: boolean;
      correct_answer?: string;
      explanation?: string;
    }> = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const options = question.options || [];
      let isCorrect = false;

      if (question.question_type === 'multiple_choice' || question.question_type === 'applied_scenario') {
        // userAnswer is the option_id they selected
        const correctOption = options.find((o: { is_correct: boolean }) => o.is_correct);
        isCorrect = correctOption?.id === userAnswer;
        
        feedback.push({
          question_id: question.id,
          correct: isCorrect,
          correct_answer: correctOption?.option_text,
          explanation: question.explanation || undefined,
        });
      } else if (question.question_type === 'short_answer') {
        // Compare answer text case-insensitively
        const correctOptions = options.filter((o: { is_correct: boolean }) => o.is_correct);
        isCorrect = correctOptions.some(
          (o: { option_text: string }) => o.option_text.toLowerCase().trim() === (userAnswer || '').toLowerCase().trim()
        );
        
        feedback.push({
          question_id: question.id,
          correct: isCorrect,
          correct_answer: correctOptions[0]?.option_text,
          explanation: question.explanation || undefined,
        });
      } else {
        // matching type - simplified for MVP
        const correctOption = options.find((o: { is_correct: boolean }) => o.is_correct);
        isCorrect = correctOption?.id === userAnswer;
        
        feedback.push({
          question_id: question.id,
          correct: isCorrect,
          correct_answer: correctOption?.option_text,
          explanation: question.explanation || undefined,
        });
      }

      if (isCorrect) correctCount++;
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= test.passing_score;

    // Save the attempt
    await supabase.from('mastery_attempts').insert({
      user_id: session.userId,
      node_id,
      mastery_test_id: test_id,
      score,
      passed,
      answers,
    });

    // Update user progress
    const { data: existingProgress } = await supabase
      .from('user_node_progress')
      .select('*')
      .eq('user_id', session.userId)
      .eq('node_id', node_id)
      .single();

    const now = new Date().toISOString();

    if (existingProgress) {
      const updates: Record<string, unknown> = {
        latest_score: score,
        attempt_count: existingProgress.attempt_count + 1,
      };
      if (passed) {
        updates.status = 'mastered';
        updates.mastered_at = now;
      }
      await supabase
        .from('user_node_progress')
        .update(updates)
        .eq('id', existingProgress.id);
    } else {
      await supabase.from('user_node_progress').insert({
        user_id: session.userId,
        node_id,
        status: passed ? 'mastered' : 'in_progress',
        first_interacted_at: now,
        mastered_at: passed ? now : null,
        latest_score: score,
        attempt_count: 1,
      });
    }

    return NextResponse.json({
      result: {
        score,
        passed,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        feedback,
      },
    });
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
