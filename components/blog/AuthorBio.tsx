// ABOUTME: Author bio component for personal blog with organic Koucai mention
// ABOUTME: Displays Ben's identity and current projects naturally

import React from 'react';
import styles from './AuthorBio.module.css';

export default function AuthorBio() {
  return (
    <div className={styles.authorBio}>
      <h3 className={styles.heading}>About Ben</h3>
      <p className={styles.bio}>
        Builder and software engineer exploring frontier AI coding techniques.
        Currently building{' '}
        <a
          href="https://koucai.chat"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          koucai.chat
        </a>
        , a Chinese learning app. Writing monthly about AI-assisted development
        and product building.
      </p>
      <div className={styles.links}>
        <a
          href="https://github.com/benredmond"
          className={styles.socialLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/benredmond"
          className={styles.socialLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
