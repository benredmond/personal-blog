'use client';

import { useState, useEffect } from 'react';
import styles from './Poll.module.css';

interface PollProps {
  pollId?: string;
  question?: string;
  options?: string;
}

const POLL_LABELS: Record<string, string> = {
  claude: 'Claude',
  codex: 'Codex',
  tie: 'Tie',
};

export default function Poll({
  pollId = 'claude-vs-codex',
  question = 'Who won?',
  options = 'claude,codex,tie',
}: PollProps) {
  const id = pollId;
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionList = options.split(',').map((o) => o.trim());
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  useEffect(() => {
    fetch(`/api/poll/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load poll');
        return res.json();
      })
      .then((data) => {
        setVotes(data.votes);
        setHasVoted(data.hasVoted);
        if (data.hasVoted && data.userVote) {
          setUserVote(data.userVote);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption || hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/poll/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: selectedOption }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit vote');
      }

      setVotes((prev) => ({
        ...prev,
        [selectedOption]: (prev[selectedOption] || 0) + 1,
      }));
      setUserVote(selectedOption);
      setHasVoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.poll}>
        <p className={styles.loading}>Loading poll...</p>
      </div>
    );
  }

  if (error && !hasVoted) {
    return (
      <div className={styles.poll}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  // Results view (after voting)
  if (hasVoted) {
    return (
      <div className={styles.poll}>
        <h3 className={styles.question}>{question}</h3>
        <div className={styles.results}>
          {optionList.map((option, index) => {
            const count = votes[option] || 0;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

            return (
              <div key={option} className={styles.resultRow}>
                <div className={styles.resultLabel}>
                  <span>{POLL_LABELS[option] || option}</span>
                  {userVote === option && <span className={styles.yourVote}>← yours</span>}
                </div>
                <div className={styles.resultBarContainer}>
                  <div
                    className={styles.resultBar}
                    style={{
                      width: `${percentage}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
                <div className={styles.resultStats}>
                  {percentage}% ({count} vote{count !== 1 ? 's' : ''})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Voting view (before voting)
  return (
    <div className={styles.poll}>
      <h3 className={styles.question}>{question}</h3>
      <div className={styles.options}>
        {optionList.map((option) => (
          <button
            key={option}
            className={`${styles.option} ${selectedOption === option ? styles.selected : ''}`}
            onClick={() => setSelectedOption(option)}
          >
            {POLL_LABELS[option] || option}
          </button>
        ))}
      </div>
      {selectedOption && (
        <button
          className={styles.submitButton}
          onClick={handleVote}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Vote'}
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
