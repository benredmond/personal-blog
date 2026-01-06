/**
 * @jest-environment node
 */

// ABOUTME: Tests poll API route GET/POST behavior with KV-backed storage
// ABOUTME: Verifies validation, cookie handling, and vote persistence

import type { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/poll/[id]/route';
import { mockPollStore } from '@/lib/poll-store';
import { cookies } from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('poll API route', () => {
  beforeEach(() => {
    mockPollStore.reset();
    jest.clearAllMocks();
  });

  it('returns 404 for unknown poll', async () => {
    const cookieStore = { has: jest.fn(), get: jest.fn() };
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: 'unknown' }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Unknown poll');
  });

  it('returns votes and user vote state for known poll', async () => {
    const cookieStore = {
      has: jest.fn(() => true),
      get: jest.fn((key: string) => (key.endsWith(':option') ? { value: 'codex' } : undefined)),
    };
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: 'claude-vs-codex' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.votes).toEqual({ claude: 0, codex: 0, tie: 0 });
    expect(data.hasVoted).toBe(true);
    expect(data.userVote).toBe('codex');
  });

  it('prevents duplicate votes via cookie', async () => {
    const cookieStore = { has: jest.fn(() => true), get: jest.fn() };
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const request = {
      json: async () => ({ option: 'claude' }),
    } as NextRequest;

    const response = await POST(request, { params: Promise.resolve({ id: 'claude-vs-codex' }) });

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe('Already voted');
  });

  it('rejects invalid poll options', async () => {
    const cookieStore = { has: jest.fn(() => false), get: jest.fn() };
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const request = {
      json: async () => ({ option: 'invalid' }),
    } as NextRequest;

    const response = await POST(request, { params: Promise.resolve({ id: 'claude-vs-codex' }) });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid option');
  });

  it('records votes and sets cookies on success', async () => {
    const cookieStore = { has: jest.fn(() => false), get: jest.fn() };
    (cookies as jest.Mock).mockResolvedValue(cookieStore);

    const request = {
      json: async () => ({ option: 'claude' }),
    } as NextRequest;

    const response = await POST(request, { params: Promise.resolve({ id: 'claude-vs-codex' }) });
    expect(response.status).toBe(200);

    const cookieHeader = response.headers.get('set-cookie') || '';
    expect(cookieHeader).toContain('voted:claude-vs-codex');

    (cookies as jest.Mock).mockResolvedValue({ has: jest.fn(() => false), get: jest.fn() });
    const getResponse = await GET({} as NextRequest, {
      params: Promise.resolve({ id: 'claude-vs-codex' }),
    });
    const data = await getResponse.json();
    expect(data.votes.claude).toBe(1);
  });
});
