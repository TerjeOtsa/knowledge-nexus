import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/prerequisites - Fetch all prerequisites
 */
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: prerequisites, error } = await supabase
      .from('prerequisites')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch prerequisites error:', error);
      return NextResponse.json({ error: 'Failed to fetch prerequisites' }, { status: 500 });
    }

    return NextResponse.json({ prerequisites: prerequisites || [] });
  } catch (error) {
    console.error('Fetch prerequisites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
