import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { createSubjectSchema } from '@/lib/validations';

/**
 * GET /api/subjects - Fetch all subjects
 */
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Fetch subjects error:', error);
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }

    return NextResponse.json({ subjects: subjects || [] });
  } catch (error) {
    console.error('Fetch subjects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/subjects - Create a new subject
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createSubjectSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: subject, error } = await supabase
      .from('subjects')
      .insert(validation.data)
      .select('*')
      .single();

    if (error) {
      console.error('Create subject error:', error);
      return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
    }

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error('Create subject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
