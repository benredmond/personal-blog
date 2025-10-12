// ABOUTME: Empty state component for when no blog posts are available
// ABOUTME: Server Component compatible with Link navigation

import React from 'react';
import Link from 'next/link';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  message: string;
  action?: {
    text: string;
    href: string;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => {
  return (
    <div className={styles.container}>
      <p className={styles.message}>{message}</p>
      {action && (
        <Link href={action.href} className={styles.actionButton}>
          {action.text}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
