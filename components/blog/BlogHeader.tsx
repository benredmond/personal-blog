// ABOUTME: Personal blog header with navigation and branding
// ABOUTME: Links to main site, blog, and social profiles

import React from 'react';
import Link from 'next/link';
import styles from './BlogHeader.module.css';

export default function BlogHeader() {
  return (
    <header className={styles.blogHeader}>
      <div className={styles.container}>
        <h1 className={styles.title}>Ben Redmond</h1>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/blog" className={styles.navLink}>
            Blog
          </Link>
          <a
            href="https://github.com/benredmond"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/benredmond"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </nav>
      </div>
    </header>
  );
}
