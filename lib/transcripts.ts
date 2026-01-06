import fs from 'fs';
import path from 'path';

// Types matching agentexport's RenderedMessage structure
export interface RenderedMessage {
  role: 'user' | 'assistant' | 'tool' | 'thinking' | 'system';
  content: string;
  raw?: string;
  raw_label?: string;
  tool_use_id?: string;
  model?: string;
  originalIndex: number;
}

export interface Transcript {
  tool: 'Claude Code' | 'Codex';
  model?: string;
  messages: RenderedMessage[];
}

export interface Annotation {
  messageIndex: number;
  tool: 'claude' | 'codex';
  phase: string;
  content: string;
  highlight?: string;
}

function cleanClaudeUserText(text: string): string {
  let cleaned = text;

  cleaned = cleaned.replace(/<command-args>([\s\S]*?)<\/command-args>/g, (_, args) => args.trim());
  cleaned = cleaned.replace(/<command-(?:message|name)>[\s\S]*?<\/command-(?:message|name)>/g, '');
  cleaned = cleaned.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '');
  cleaned = cleaned.replace(/<\/?command-[^>]+>/g, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

function hasMarkdownStructure(text: string): boolean {
  return (
    /(^|\n)#{2,6}\s/.test(text) ||
    /```/.test(text) ||
    /(^|\n)[-*]\s+/.test(text) ||
    /\n\|.+\|\n\|[-:|\s]+\|/.test(text)
  );
}

function isClaudeMetaMessage(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return true;
  if (normalized.length > 320 || hasMarkdownStructure(normalized)) return false;

  const metaPattern =
    /\b(apex:\w+|skill|agents?|spawn(?:ing)?|todos?|task brief|update the task|update the todos|TaskOutput|TodoWrite)\b/i;

  return metaPattern.test(normalized);
}

// Parse Claude Code JSONL format
function parseClaudeJsonl(content: string): RenderedMessage[] {
  const messages: RenderedMessage[] = [];
  const lines = content.split('\n').filter((line) => line.trim());
  let messageIndex = 0;

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // Skip non-message entries
      if (entry.type === 'summary' || entry.type === 'file-history-snapshot') {
        continue;
      }

      // User messages
      if (entry.type === 'user' && entry.message?.role === 'user') {
        const userContent = entry.message.content;
        let text = '';

        if (typeof userContent === 'string') {
          text = userContent;
        } else if (Array.isArray(userContent)) {
          // Extract text from content array
          for (const item of userContent) {
            if (item.type === 'text') {
              text += item.text + '\n';
            }
          }
        }

        const cleanedText = cleanClaudeUserText(text);

        // Skip meta messages, tool results, and skill expansions
        if (
          entry.isMeta ||
          cleanedText.includes('tool_result') ||
          cleanedText.includes('Use the `') ||
          cleanedText.includes('<skill>')
        ) {
          continue;
        }

        if (cleanedText.trim()) {
          messages.push({ role: 'user', content: cleanedText.trim(), originalIndex: messageIndex++ });
        }
      }

      // Assistant messages
      if (entry.type === 'assistant' && entry.message?.role === 'assistant') {
        const contentArray = entry.message.content;
        if (Array.isArray(contentArray)) {
          for (const item of contentArray) {
            if (item.type === 'text' && item.text?.trim()) {
              const text = item.text.trim();
              const role = isClaudeMetaMessage(text) ? 'thinking' : 'assistant';
              messages.push({
                role,
                content: text,
                model: entry.message.model,
                originalIndex: messageIndex++,
              });
            } else if (item.type === 'thinking' && item.thinking?.trim()) {
              messages.push({
                role: 'thinking',
                content: item.thinking.trim(),
                model: entry.message.model,
                originalIndex: messageIndex++,
              });
            } else if (item.type === 'tool_use') {
              messages.push({
                role: 'tool',
                content: `${item.name}`,
                raw: JSON.stringify(item.input, null, 2),
                raw_label: 'Input',
                tool_use_id: item.id,
                originalIndex: messageIndex++,
              });
            }
          }
        }
      }
    } catch {
      // Skip malformed lines
      continue;
    }
  }

  return messages;
}

// Parse Codex CLI JSONL format
function parseCodexJsonl(content: string): RenderedMessage[] {
  const messages: RenderedMessage[] = [];
  const lines = content.split('\n').filter((line) => line.trim());
  let currentModel: string | undefined;
  let messageIndex = 0;

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // Extract model from turn_context
      if (entry.type === 'turn_context' && entry.payload?.model) {
        const effort = entry.payload.effort;
        currentModel = effort ? `${entry.payload.model} ${effort}` : entry.payload.model;
      }

      // Response items (messages)
      if (entry.type === 'response_item' && entry.payload) {
        const payload = entry.payload;

        // User messages
        if (payload.role === 'user' && payload.content) {
          for (const item of payload.content) {
            if (item.type === 'input_text' && item.text?.trim()) {
              // Skip internal context messages and skill expansions
              if (
                item.text.includes('<INSTRUCTIONS>') ||
                item.text.includes('<environment_context>') ||
                item.text.includes('<skill>')
              ) {
                continue;
              }
              messages.push({ role: 'user', content: item.text.trim(), originalIndex: messageIndex++ });
            }
          }
        }

        // Assistant messages
        if (payload.type === 'message' && payload.role === 'assistant' && payload.content) {
          for (const item of payload.content) {
            if (item.type === 'output_text' && item.text?.trim()) {
              messages.push({
                role: 'assistant',
                content: item.text.trim(),
                model: currentModel,
                originalIndex: messageIndex++,
              });
            }
          }
        }

        // Reasoning/thinking
        if (payload.type === 'reasoning' && payload.summary) {
          for (const item of payload.summary) {
            if (item.type === 'summary_text' && item.text?.trim()) {
              messages.push({
                role: 'thinking',
                content: item.text.trim(),
                originalIndex: messageIndex++,
              });
            }
          }
        }

        // Tool calls
        if (payload.type === 'function_call') {
          messages.push({
            role: 'tool',
            content: payload.name || 'function_call',
            raw: payload.arguments,
            raw_label: 'Arguments',
            tool_use_id: payload.call_id,
            originalIndex: messageIndex++,
          });
        }
      }
    } catch {
      // Skip malformed lines
      continue;
    }
  }

  return messages;
}

export function loadTranscript(phase: string, tool: 'claude' | 'codex'): Transcript {
  const filePath = path.join(process.cwd(), 'data', 'transcripts', `${phase}-${tool}.jsonl`);

  if (!fs.existsSync(filePath)) {
    return {
      tool: tool === 'claude' ? 'Claude Code' : 'Codex',
      messages: [],
    };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const messages = tool === 'claude' ? parseClaudeJsonl(content) : parseCodexJsonl(content);

  // Extract model from first assistant message
  const firstAssistant = messages.find((m) => m.model);

  return {
    tool: tool === 'claude' ? 'Claude Code' : 'Codex',
    model: firstAssistant?.model,
    messages,
  };
}

export function loadAllTranscripts(): Record<string, Transcript> {
  const phases = ['research', 'planning', 'review', 'supporting-1', 'supporting-2'];
  const tools: Array<'claude' | 'codex'> = ['claude', 'codex'];
  const result: Record<string, Transcript> = {};

  for (const phase of phases) {
    for (const tool of tools) {
      result[`${phase}-${tool}`] = loadTranscript(phase, tool);
    }
  }

  return result;
}

export function loadPlans(): { claude: string; codex: string } {
  const claudePath = path.join(process.cwd(), 'data', 'plans', 'claude-plan.md');
  const codexPath = path.join(process.cwd(), 'data', 'plans', 'codex-plan.md');

  return {
    claude: fs.existsSync(claudePath) ? fs.readFileSync(claudePath, 'utf-8') : '',
    codex: fs.existsSync(codexPath) ? fs.readFileSync(codexPath, 'utf-8') : '',
  };
}

export function loadAnnotations(phase: string): Annotation[] {
  const filePath = path.join(process.cwd(), 'data', 'annotations', `${phase}.json`);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}
