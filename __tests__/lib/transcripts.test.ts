// ABOUTME: Tests transcript loaders and JSONL parsing for Claude and Codex formats
// ABOUTME: Uses fs mocks to validate parsing, filtering, and annotation loading behavior

import fs from 'fs';
import path from 'path';

import { loadAnnotations, loadPlans, loadTranscript } from '@/lib/transcripts';

const buildPath = (...parts: string[]) => path.join(process.cwd(), ...parts);
const testClaudePath = buildPath('data', 'transcripts', 'test-claude.jsonl');
const testCodexPath = buildPath('data', 'transcripts', 'test-codex.jsonl');
const testAnnotationsPath = buildPath('data', 'annotations', 'test.json');
const cleanupPaths = [testClaudePath, testCodexPath, testAnnotationsPath];

describe('transcripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    const claudeSample = [
      JSON.stringify({ type: 'summary', summary: 'skip me' }),
      JSON.stringify({ type: 'file-history-snapshot', snapshot: {} }),
      JSON.stringify({
        type: 'user',
        message: {
          role: 'user',
          content:
            '<command-message>apex:research</command-message>\n' +
            '<command-name>/apex:research</command-name>\n' +
            '<command-args>Find the best approach\nfor vector search</command-args>',
        },
      }),
      JSON.stringify({
        type: 'user',
        isMeta: true,
        message: {
          role: 'user',
          content: [{ type: 'text', text: 'Use the `apex:research` skill...' }],
        },
      }),
      JSON.stringify({
        type: 'assistant',
        message: {
          role: 'assistant',
          model: 'claude-opus-4-5',
          content: [{ type: 'text', text: 'Now spawning parallel research agents...' }],
        },
      }),
      JSON.stringify({
        type: 'assistant',
        message: {
          role: 'assistant',
          model: 'claude-opus-4-5',
          content: [
            { type: 'text', text: 'Assistant reply' },
            { type: 'thinking', thinking: 'Internal thought' },
            { type: 'tool_use', id: 'tool1', name: 'Search', input: { q: 'docs' } },
          ],
        },
      }),
    ].join('\n');

    const codexSample = [
      JSON.stringify({ type: 'turn_context', payload: { model: 'gpt-4.1' } }),
      JSON.stringify({
        type: 'response_item',
        payload: {
          role: 'user',
          content: [
            { type: 'input_text', text: '<INSTRUCTIONS>skip</INSTRUCTIONS>' },
            { type: 'input_text', text: 'Hello there' },
          ],
        },
      }),
      JSON.stringify({
        type: 'response_item',
        payload: {
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: 'Hi back' }],
        },
      }),
      JSON.stringify({
        type: 'response_item',
        payload: {
          type: 'reasoning',
          summary: [{ type: 'summary_text', text: 'Thinking out loud' }],
        },
      }),
      JSON.stringify({
        type: 'response_item',
        payload: {
          type: 'function_call',
          name: 'doThing',
          arguments: '{"a":1}',
          call_id: 'call-1',
        },
      }),
    ].join('\n');

    fs.writeFileSync(testClaudePath, claudeSample);
    fs.writeFileSync(testCodexPath, codexSample);
    fs.writeFileSync(
      testAnnotationsPath,
      JSON.stringify([{ messageIndex: 2, tool: 'claude', phase: 'test', content: 'Note' }])
    );
  });

  afterAll(() => {
    cleanupPaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  it('parses Claude JSONL and strips command tags', () => {
    const transcript = loadTranscript('test', 'claude');

    expect(transcript.tool).toBe('Claude Code');
    expect(transcript.model).toBe('claude-opus-4-5');
    expect(transcript.messages).toHaveLength(5);

    expect(transcript.messages[0]).toMatchObject({
      role: 'user',
      content: 'Find the best approach\nfor vector search',
    });
    expect(transcript.messages[1]).toMatchObject({
      role: 'thinking',
      content: 'Now spawning parallel research agents...',
    });
    expect(transcript.messages[2].role).toBe('assistant');
    expect(transcript.messages[3].role).toBe('thinking');
    expect(transcript.messages[4].role).toBe('tool');
  });

  it('parses Codex JSONL into roles and captures model', () => {
    const transcript = loadTranscript('test', 'codex');

    expect(transcript.tool).toBe('Codex');
    expect(transcript.model).toBe('gpt-4.1');
    expect(transcript.messages.map((msg) => msg.role)).toEqual([
      'user',
      'assistant',
      'thinking',
      'tool',
    ]);
  });

  it('loads annotations and plans from disk', () => {
    const annotations = loadAnnotations('test');
    const plans = loadPlans();

    expect(annotations).toHaveLength(1);
    expect(annotations[0].content).toBe('Note');
    expect(plans.claude.length).toBeGreaterThan(0);
    expect(plans.codex.length).toBeGreaterThan(0);
  });
});
