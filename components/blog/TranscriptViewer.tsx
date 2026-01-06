'use client';

import { useEffect, useMemo, useState } from 'react';
import type { RenderedMessage, Transcript, Annotation } from '@/lib/transcripts';
import styles from './TranscriptViewer.module.css';

const DEFAULT_MOBILE_MEDIA_QUERY = '(max-width: 1023px)';

interface TranscriptViewerProps {
  phase: string;
  claudeTranscript: Transcript | null;
  codexTranscript: Transcript | null;
  annotations: Annotation[];
}

interface MessageProps {
  message: RenderedMessage;
  originalIndex: number;
  annotation?: Annotation;
}

function Message({ message, annotation }: MessageProps) {
  const roleLabel =
    message.role === 'thinking'
      ? 'thinking'
      : message.role === 'tool'
        ? 'tool'
        : message.role;
  const lines = message.content.split('\n');

  return (
    <>
      <div className={`${styles.message} ${styles[message.role]}`}>
        <span className={styles.role}>{roleLabel}</span>
        <div className={styles.content}>
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
          {message.raw && (
            <details className={styles.rawDetails}>
              <summary>{message.raw_label || 'Details'}</summary>
              <pre className={styles.rawContent}>{message.raw}</pre>
            </details>
          )}
        </div>
      </div>
      {annotation && (
        <div className={styles.annotation}>
          <span className={styles.annotationIcon}>✦</span>
          {annotation.content}
        </div>
      )}
    </>
  );
}

export default function TranscriptViewer({
  claudeTranscript,
  codexTranscript,
  annotations,
}: TranscriptViewerProps) {
  const [activeTab, setActiveTab] = useState<'claude' | 'codex'>('claude');
  const [showThinking, setShowThinking] = useState(false);
  const [showToolCalls, setShowToolCalls] = useState(false);
  const [preferredView, setPreferredView] = useState<'tabs' | 'h2h'>('tabs');
  const [hasUserSetView, setHasUserSetView] = useState(false);
  const canUseH2H = Boolean(claudeTranscript && codexTranscript);
  const viewMode = canUseH2H ? preferredView : 'tabs';

  const transcript = activeTab === 'claude' ? claudeTranscript : codexTranscript;

  useEffect(() => {
    if (hasUserSetView) return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia(DEFAULT_MOBILE_MEDIA_QUERY);
    const applyDefault = () => {
      if (!canUseH2H) {
        setPreferredView('tabs');
        return;
      }
      setPreferredView(media.matches ? 'tabs' : 'h2h');
    };

    applyDefault();
    if (media.addEventListener) {
      media.addEventListener('change', applyDefault);
      return () => media.removeEventListener('change', applyDefault);
    }
    media.addListener(applyDefault);
    return () => media.removeListener(applyDefault);
  }, [canUseH2H, hasUserSetView]);

  const filteredMessages = useMemo(() => {
    if (!transcript) return [];
    return transcript.messages.filter((msg) => {
      if (msg.role === 'thinking' && !showThinking) return false;
      if (msg.role === 'tool' && !showToolCalls) return false;
      if (msg.role === 'system') return false;
      return true;
    });
  }, [transcript, showThinking, showToolCalls]);

  const claudeFiltered = useMemo(() => {
    if (!claudeTranscript) return [];
    return claudeTranscript.messages.filter((msg) => {
      if (msg.role === 'thinking' && !showThinking) return false;
      if (msg.role === 'tool' && !showToolCalls) return false;
      if (msg.role === 'system') return false;
      return true;
    });
  }, [claudeTranscript, showThinking, showToolCalls]);

  const codexFiltered = useMemo(() => {
    if (!codexTranscript) return [];
    return codexTranscript.messages.filter((msg) => {
      if (msg.role === 'thinking' && !showThinking) return false;
      if (msg.role === 'tool' && !showToolCalls) return false;
      if (msg.role === 'system') return false;
      return true;
    });
  }, [codexTranscript, showThinking, showToolCalls]);

  const getAnnotation = (tool: 'claude' | 'codex', originalIndex: number) => {
    return annotations.find((a) => a.tool === tool && a.messageIndex === originalIndex);
  };

  return (
    <div className={`${styles.viewer} ${viewMode === 'h2h' ? styles.h2hMode : ''}`}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.toggles}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showThinking}
              onChange={(e) => setShowThinking(e.target.checked)}
            />
            Thinking
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showToolCalls}
              onChange={(e) => setShowToolCalls(e.target.checked)}
            />
            Tool calls
          </label>
        </div>

        <div className={styles.viewSwitch}>
          <button
            className={`${styles.viewButton} ${viewMode === 'tabs' ? styles.active : ''}`}
            onClick={() => {
              setHasUserSetView(true);
              setPreferredView('tabs');
            }}
          >
            Tabs
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'h2h' ? styles.active : ''}`}
            onClick={() => {
              setHasUserSetView(true);
              setPreferredView('h2h');
            }}
            disabled={!canUseH2H}
          >
            H2H
          </button>
        </div>
      </div>

      {/* Tab Bar (tabs mode only) */}
      {viewMode === 'tabs' && (
        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'claude'}
            className={`${styles.tab} ${activeTab === 'claude' ? styles.active : ''}`}
            onClick={() => setActiveTab('claude')}
          >
            Claude
            {claudeTranscript?.model && (
              <span className={styles.model}>{claudeTranscript.model}</span>
            )}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'codex'}
            className={`${styles.tab} ${activeTab === 'codex' ? styles.active : ''}`}
            onClick={() => setActiveTab('codex')}
          >
            Codex
            {codexTranscript?.model && (
              <span className={styles.model}>{codexTranscript.model}</span>
            )}
          </button>
        </div>
      )}

      {/* Content Area */}
      {viewMode === 'tabs' ? (
        <div className={styles.messages} role="tabpanel">
          {filteredMessages.length === 0 ? (
            <div className={styles.empty}>No messages to display</div>
          ) : (
            filteredMessages.map((msg, i) => (
              <Message key={i} message={msg} originalIndex={msg.originalIndex} annotation={getAnnotation(activeTab, msg.originalIndex)} />
            ))
          )}
        </div>
      ) : (
        <div className={styles.h2hContainer}>
          <div className={styles.h2hColumn}>
            <div className={styles.h2hHeader}>
              <span className={styles.h2hLabel}>Claude</span>
              {claudeTranscript?.model && (
                <span className={styles.h2hModel}>{claudeTranscript.model}</span>
              )}
            </div>
            <div className={styles.h2hMessages}>
              {claudeFiltered.map((msg, i) => (
                <Message key={i} message={msg} originalIndex={msg.originalIndex} annotation={getAnnotation('claude', msg.originalIndex)} />
              ))}
            </div>
          </div>
          <div className={styles.h2hDivider} />
          <div className={styles.h2hColumn}>
            <div className={styles.h2hHeader}>
              <span className={styles.h2hLabel}>Codex</span>
              {codexTranscript?.model && (
                <span className={styles.h2hModel}>{codexTranscript.model}</span>
              )}
            </div>
            <div className={styles.h2hMessages}>
              {codexFiltered.map((msg, i) => (
                <Message key={i} message={msg} originalIndex={msg.originalIndex} annotation={getAnnotation('codex', msg.originalIndex)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
