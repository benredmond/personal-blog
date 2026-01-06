import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { pollStore } from '@/lib/poll-store';

// Bypass edge cache - always fetch fresh results
export const dynamic = 'force-dynamic';

// Allowed polls and their options (whitelist)
const POLLS: Record<string, string[]> = {
  'claude-vs-codex': ['claude', 'codex', 'tie'],
};

// GET: Fetch current results
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allowedOptions = POLLS[id];

  if (!allowedOptions) {
    return NextResponse.json({ error: 'Unknown poll' }, { status: 404 });
  }

  const raw = (await pollStore.hgetall<Record<string, string>>(`poll:${id}`)) || {};
  const votes: Record<string, number> = {};
  for (const option of allowedOptions) {
    votes[option] = parseInt(raw[option] || '0', 10);
  }

  const cookieStore = await cookies();
  const hasVoted = cookieStore.has(`voted:${id}`);
  const userVote = cookieStore.get(`voted:${id}:option`)?.value;

  return NextResponse.json({ votes, hasVoted, userVote });
}

// POST: Submit vote
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allowedOptions = POLLS[id];

  if (!allowedOptions) {
    return NextResponse.json({ error: 'Unknown poll' }, { status: 404 });
  }

  const cookieStore = await cookies();

  // Anti-abuse: Check cookie
  if (cookieStore.has(`voted:${id}`)) {
    return NextResponse.json({ error: 'Already voted' }, { status: 429 });
  }

  let body: { option?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { option } = body;

  // Validate option against whitelist
  if (!option || !allowedOptions.includes(option)) {
    return NextResponse.json({ error: 'Invalid option', allowed: allowedOptions }, { status: 400 });
  }

  await pollStore.hincrby(`poll:${id}`, option, 1);

  // Set voted cookies (1 year expiry)
  const response = NextResponse.json({ success: true });
  response.cookies.set(`voted:${id}`, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  response.cookies.set(`voted:${id}:option`, option, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
