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
              I&apos;m Ben, a product engineer shipping AI applications on the side while helping
              MongoDB adopt AI at enterprise scale. Currently building{' '}
              <a
                href="https://koucai.chat"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.inlineLink}
              >
                koucai.chat
              </a>
              —a Chinese learning app where students practice conversations with adaptive AI tutors.
            </p>
          </section>

          {/* Blog CTA */}
          <section className={styles.blog}>
            <h2 className={styles.sectionTitle}>Writing</h2>
            <p className={styles.blogDescription}>
              I write about what works (and what breaks) when building with AI:
            </p>
            <ul className={styles.topicList}>
              <li>Structuring code to be readable by AI agents, not just human reviewers</li>
              <li>When to ship, iterate, or kill: managing AI-assisted build cycles</li>
              <li>When to trust AI-generated code (and when the stakes are too high)</li>
              <li>Architecture decisions that seem small but compound over time</li>
            </ul>
            <p className={styles.blogSubtext}>
              Monthly posts for AI product builders who care about what actually works.
            </p>
            <Link href="/blog" className={styles.blogLink}>
              Read the blog →
            </Link>
          </section>

          {/* Connect */}
          <section className={styles.connect}>
            <h2 className={styles.sectionTitle}>Connect</h2>
            <div className={styles.socialLinks}>
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
          </section>
        </main>
      </MasterGrid>
    </>
  );
}
