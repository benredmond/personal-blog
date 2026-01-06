// ABOUTME: Tests Poll component loading, voting, and error states
// ABOUTME: Mocks fetch to validate client-side polling behavior

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Poll from '@/components/blog/Poll';

describe('Poll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders options after loading', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        votes: { claude: 1, codex: 2, tie: 0 },
        hasVoted: false,
      }),
    });

    render(<Poll />);

    expect(screen.getByText('Loading poll...')).toBeInTheDocument();

    const claudeOption = await screen.findByRole('button', { name: 'Claude' });
    expect(claudeOption).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Vote' })).not.toBeInTheDocument();
  });

  it('submits a vote and shows results', async () => {
    const user = userEvent.setup();
    const fetchMock = global.fetch as jest.Mock;

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          votes: { claude: 1, codex: 2, tie: 0 },
          hasVoted: false,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<Poll />);

    const claudeOption = await screen.findByRole('button', { name: 'Claude' });
    await user.click(claudeOption);

    await user.click(screen.getByRole('button', { name: 'Vote' }));

    await waitFor(() => {
      expect(screen.getByText('← yours')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/poll/claude-vs-codex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: 'claude' }),
    });
  });

  it('shows error state when poll fails to load', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<Poll />);

    expect(await screen.findByText('Failed to load poll')).toBeInTheDocument();
  });
});
