import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

// Unambiguous alphabet — no 0/O, 1/I confusion
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXY23456789';

function generateCode(): string {
  return Array.from(
    { length: 6 },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  ).join('');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { node_id?: string; label?: string };

    if (!body.node_id?.trim()) {
      return NextResponse.json({ error: 'node_id is required.' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify the node exists
    const { data: node, error: nodeError } = await supabase
      .from('nodes')
      .select('id, title')
      .eq('id', body.node_id)
      .single();

    if (nodeError || !node) {
      return NextResponse.json({ error: 'Node not found.' }, { status: 404 });
    }

    // Check if a code already exists for this node by this user — reuse it
    const { data: existing } = await supabase
      .from('share_codes')
      .select('code')
      .eq('node_id', body.node_id)
      .eq('created_by', session.userId)
      .single();

    if (existing?.code) {
      return NextResponse.json({ code: existing.code });
    }

    // Generate a unique code (retry on collision, max 5 attempts)
    let code = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCode();
      const { data: collision } = await supabase
        .from('share_codes')
        .select('code')
        .eq('code', candidate)
        .maybeSingle();

      if (!collision) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return NextResponse.json({ error: 'Failed to generate a unique code. Try again.' }, { status: 500 });
    }

    const { error: insertError } = await supabase.from('share_codes').insert({
      code,
      created_by: session.userId,
      node_id: body.node_id,
      label: body.label || node.title,
    });

    if (insertError) {
      return NextResponse.json({ error: `Failed to save share code: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Share code create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
