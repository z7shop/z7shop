import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const typingState = new Map<string, { user_typing: boolean; admin_typing: boolean; updated_at: number }>();

function cleanup() {
  const now = Date.now();
  typingState.forEach((val, key) => {
    if (now - val.updated_at > 10000) {
      typingState.delete(key);
    }
  });
}

export async function GET(req: NextRequest) {
  cleanup();
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ user_typing: false, admin_typing: false });
  }

  const state = typingState.get(sessionId);
  if (!state || Date.now() - state.updated_at > 5000) {
    return NextResponse.json({ user_typing: false, admin_typing: false });
  }

  return NextResponse.json({
    user_typing: state.user_typing,
    admin_typing: state.admin_typing,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, is_typing, role } = body;

  if (!session_id) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  cleanup();

  const existing = typingState.get(session_id) || { user_typing: false, admin_typing: false, updated_at: 0 };

  if (role === 'admin') {
    existing.admin_typing = !!is_typing;
  } else {
    existing.user_typing = !!is_typing;
  }
  existing.updated_at = Date.now();

  typingState.set(session_id, existing);

  return NextResponse.json({ success: true });
}
