// ABOUTME: Author bio component for personal blog with organic Koucai mention
// ABOUTME: Displays Ben's identity and current projects naturally

import React from 'react';
import styles from './AuthorBio.module.css';

export default function AuthorBio() {
  return (
    <div className={styles.authorBio}>
      <h3 className={styles.heading}>About Me</h3>
      <p className={styles.bio}>
        Product engineer shipping AI applications on the side while helping MongoDB adopt AI at
        enterprise scale. Currently building{' '}
        <a
          href="https://koucai.chat"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          koucai.chat
        </a>
        , a Chinese learning app with adaptive AI tutors. I write about what works (and what breaks)
        when building with AI in production.
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
          href="https://linkedin.com/in/ben-redmond1/"
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
