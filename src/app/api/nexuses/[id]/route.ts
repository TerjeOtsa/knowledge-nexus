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
    const { data: nexus, error } = await supabase
      .from('nexuses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !nexus) {
      return NextResponse.json({ error: 'Nexus not found.' }, { status: 404 });
    }

    // Allow owner or subscriber
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

    return NextResponse.json({ nexus, isOwner });
  } catch (error) {
    console.error('GET /api/nexuses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('nexuses')
      .select('created_by')
      .eq('id', params.id)
      .single();

    if (!existing || existing.created_by !== session.userId) {
      return NextResponse.json({ error: 'Not found or access denied.' }, { status: 403 });
    }

    const body = await request.json() as { title?: string; description?: string; visibility?: string };
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title?.trim()) updates.title = body.title.trim();
    if ('description' in body) updates.description = body.description?.trim() || null;
    if (body.visibility === 'private' || body.visibility === 'link') updates.visibility = body.visibility;

    const { data: nexus, error } = await supabase
      .from('nexuses')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error || !nexus) {
      return NextResponse.json({ error: error?.message || 'Update failed.' }, { status: 500 });
    }

    return NextResponse.json({ nexus });
  } catch (error) {
    console.error('PATCH /api/nexuses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: existing } = await supabase
      .from('nexuses')
      .select('created_by')
      .eq('id', params.id)
      .single();

    if (!existing || existing.created_by !== session.userId) {
      return NextResponse.json({ error: 'Not found or access denied.' }, { status: 403 });
    }

    const { error } = await supabase.from('nexuses').delete().eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/nexuses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
