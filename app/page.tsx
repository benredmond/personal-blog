// ABOUTME: Home page for personal site with Scandinavian Strata design
// ABOUTME: Introduction, current work, and navigation to blog

import React from 'react';
import Link from 'next/link';
import BlogHeader from '@/components/blog/BlogHeader';
import MasterGrid from '@/components/layout/MasterGrid';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <BlogHeader />
      <MasterGrid>
        <main className={`col-span-12 md:col-span-8 md:col-start-3 ${styles.main}`}>
          {/* Hero section */}
          <section className={styles.hero}>
            <h1 className={styles.title}>Building AI-native products in production.</h1>
            <p className={styles.intro}>
              I&apos;m Ben, a software engineer at MongoDB, building{' '}
              <a
                href="https://koucai.chat"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.inlineLink}
              >
                koucai.chat
              </a>{' '}
              on the side—a Chinese learning app where students practice conversations with adaptive
              AI tutors.
            </p>
          </section>

          {/* Blog CTA */}
          <section className={styles.blog}>
            <h2 className={styles.sectionTitle}>Writing</h2>
            <p className={styles.blogDescription}>
              Writing about my thoughts and experiences using AI, both in enterprise and greenfield
              projects:
            </p>
            <ul className={styles.topicList}>
              <li>How I used Claude Code to build Koucai</li>
              <li>What works when using AI in an enterprise codebase with millions of LOC</li>
              <li>Is Claude being nice to me?</li>
            </ul>
            <Link href="/blog" className={styles.blogLink}>
              Read the blog →
            </Link>
          </section>

          {/* Connect */}
          <section className={styles.connect}>
            <h2 className={styles.sectionTitle}>Connect</h2>
            <div className={styles.socialLinks}>
              <a href="mailto:benjamin.j.redmond@gmail.com" className={styles.socialLink}>
                Email
              </a>
              <a
                href="https://github.com/benredmond"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/ben-redmond1"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </section>
        </main>
      </MasterGrid>
    </>
  );
}
