'use client';

import { useEffect, useState } from 'react';
import styles from './PlanComparison.module.css';

interface PlanComparisonProps {
  claudePlan: string | null;
  codexPlan: string | null;
  claudeModel?: string | null;
  codexModel?: string | null;
}

const DEFAULT_MOBILE_MEDIA_QUERY = '(max-width: 1023px)';

export default function PlanComparison({
  claudePlan,
  codexPlan,
  claudeModel,
  codexModel,
}: PlanComparisonProps) {
  if (!claudePlan && !codexPlan) {
    return null;
  }

  const claudeModelLabel = claudeModel || 'Plan';
  const codexModelLabel = codexModel || 'Plan';
  const [activeTab, setActiveTab] = useState<'claude' | 'codex'>(
    claudePlan ? 'claude' : 'codex',
  );
  const [preferredView, setPreferredView] = useState<'tabs' | 'h2h'>('tabs');
  const [hasUserSetView, setHasUserSetView] = useState(false);
  const canUseH2H = Boolean(claudePlan && codexPlan);
  const viewMode = canUseH2H ? preferredView : 'tabs';

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

  const renderPlan = (plan: string | null) => {
    if (!plan) {
      return <p className={styles.empty}>No plan available</p>;
    }
    return <div className={styles.planContent}>{plan}</div>;
  };

  return (
    <div className={`${styles.comparison} ${viewMode === 'h2h' ? styles.h2hMode : ''}`}>
      <div className={styles.controls}>
        <div className={styles.toggles}>
          <span className={styles.toggle}>Plan outputs</span>
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

      {viewMode === 'tabs' ? (
        <>
          <div className={styles.tabs} role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'claude'}
              className={`${styles.tab} ${activeTab === 'claude' ? styles.active : ''}`}
              onClick={() => setActiveTab('claude')}
              disabled={!claudePlan}
            >
              Claude
              <span className={styles.model}>{claudeModelLabel}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'codex'}
              className={`${styles.tab} ${activeTab === 'codex' ? styles.active : ''}`}
              onClick={() => setActiveTab('codex')}
              disabled={!codexPlan}
            >
              Codex
              <span className={styles.model}>{codexModelLabel}</span>
            </button>
          </div>
          <div className={styles.messages} role="tabpanel">
            {renderPlan(activeTab === 'claude' ? claudePlan : codexPlan)}
          </div>
        </>
      ) : (
        <div className={styles.h2hContainer}>
          <div className={styles.h2hColumn}>
            <div className={styles.h2hHeader}>
              <span className={styles.h2hLabel}>Claude</span>
              <span className={styles.h2hModel}>{claudeModelLabel}</span>
            </div>
            <div className={styles.h2hMessages}>{renderPlan(claudePlan)}</div>
          </div>
          <div className={styles.h2hDivider} />
          <div className={styles.h2hColumn}>
            <div className={styles.h2hHeader}>
              <span className={styles.h2hLabel}>Codex</span>
              <span className={styles.h2hModel}>{codexModelLabel}</span>
            </div>
            <div className={styles.h2hMessages}>{renderPlan(codexPlan)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
