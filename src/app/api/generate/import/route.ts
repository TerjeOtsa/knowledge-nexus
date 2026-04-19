import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { contentPackSchema, summarizeContentPack } from '@/lib/content-pack';
import { importContentPack } from '@/lib/content-pack-importer';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { pack?: unknown; nexus_id?: string };
    const pack = contentPackSchema.parse(body.pack);
    const importResult = await importContentPack({
      pack,
      createdBy: session.userId,
      nexusId: body.nexus_id || null,
    });

    return NextResponse.json({
      summary: summarizeContentPack(pack),
      importResult,
    });
  } catch (error) {
    console.error('Import generated content pack error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
