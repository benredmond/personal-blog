// ABOUTME: Tests TranscriptViewer behavior for tabs, filters, annotations, and H2H mode
// ABOUTME: Verifies default filtering, toggle controls, and dual-column rendering

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TranscriptViewer from '@/components/blog/TranscriptViewer';
import type { Transcript, Annotation } from '@/lib/transcripts';

const buildTranscripts = () => {
  const claudeTranscript: Transcript = {
    tool: 'Claude Code',
    model: 'claude-test',
    messages: [
      { role: 'user', content: 'Hello from Claude user', originalIndex: 0 },
      { role: 'assistant', content: 'Claude says hi', originalIndex: 1 },
      { role: 'thinking', content: 'Claude thinks', originalIndex: 2 },
      {
        role: 'tool',
        content: 'Claude tool',
        raw: '{"q":"docs"}',
        raw_label: 'Input',
        tool_use_id: 'tool-1',
        originalIndex: 3,
      },
    ],
  };

  const codexTranscript: Transcript = {
    tool: 'Codex',
    model: 'codex-test',
    messages: [
      { role: 'user', content: 'Hello from Codex user', originalIndex: 0 },
      { role: 'assistant', content: 'Codex says hi', originalIndex: 1 },
    ],
  };

  return { claudeTranscript, codexTranscript };
};

const annotations: Annotation[] = [
  { messageIndex: 1, tool: 'claude', phase: 'research', content: 'Nice answer' },
];

describe('TranscriptViewer', () => {
  it('renders tabs and Claude content by default', () => {
    const { claudeTranscript, codexTranscript } = buildTranscripts();

    render(
      <TranscriptViewer
        phase="research"
        claudeTranscript={claudeTranscript}
        codexTranscript={codexTranscript}
        annotations={annotations}
      />
    );

    expect(screen.getByRole('tab', { name: /Claude/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Codex/ })).toBeInTheDocument();
    expect(screen.getByText('Claude says hi')).toBeInTheDocument();
    expect(screen.queryByText('Codex says hi')).not.toBeInTheDocument();
  });

  it('hides thinking and tool messages until toggled on', async () => {
    const user = userEvent.setup();
    const { claudeTranscript, codexTranscript } = buildTranscripts();

    render(
      <TranscriptViewer
        phase="research"
        claudeTranscript={claudeTranscript}
        codexTranscript={codexTranscript}
        annotations={annotations}
      />
    );

    expect(screen.queryByText('Claude thinks')).not.toBeInTheDocument();
    expect(screen.queryByText('Claude tool')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Thinking'));
    await user.click(screen.getByLabelText('Tool calls'));

    expect(screen.getByText('Claude thinks')).toBeInTheDocument();
    expect(screen.getByText('Claude tool')).toBeInTheDocument();
  });

  it('renders annotations attached to matching messages', () => {
    const { claudeTranscript, codexTranscript } = buildTranscripts();

    render(
      <TranscriptViewer
        phase="research"
        claudeTranscript={claudeTranscript}
        codexTranscript={codexTranscript}
        annotations={annotations}
      />
    );

    expect(screen.getByText('Nice answer')).toBeInTheDocument();
  });

  it('switches to H2H mode and shows both transcripts', async () => {
    const user = userEvent.setup();
    const { claudeTranscript, codexTranscript } = buildTranscripts();
    const originalMatchMedia = window.matchMedia;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(min-width: 1200px)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    try {
      render(
        <TranscriptViewer
          phase="research"
          claudeTranscript={claudeTranscript}
          codexTranscript={codexTranscript}
          annotations={annotations}
        />
      );

      await user.click(screen.getByRole('button', { name: 'H2H' }));

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.getByText('Claude says hi')).toBeInTheDocument();
      expect(screen.getByText('Codex says hi')).toBeInTheDocument();
    } finally {
      if (originalMatchMedia) {
        window.matchMedia = originalMatchMedia;
      } else {
        delete (window as typeof window & { matchMedia?: unknown }).matchMedia;
      }
    }
  });
});
