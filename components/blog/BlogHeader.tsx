// ABOUTME: Personal blog header with Floating Name design
// ABOUTME: Inverted hierarchy - name top-right, nav bottom-left

import React from 'react';
import Link from 'next/link';
import styles from './BlogHeader.module.css';

export default function BlogHeader() {
  return (
    <header className={styles.blogHeader}>
      <div className={styles.container}>
        {/* Name floats top-right */}
        <div className={styles.nameFloat}>
          <h1 className={styles.title}>Ben Redmond</h1>
          <span className={styles.underline} />
        </div>

        {/* Nav anchors bottom-left */}
        <nav className={styles.navAnchor}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/blog" className={styles.navLink}>
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
