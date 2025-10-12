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
            <h1 className={styles.title}>
              Building with AI, one product at a time.
            </h1>
            <p className={styles.intro}>
              I&apos;m Ben, a software engineer exploring frontier AI coding techniques and building
              real products. I write about what I learn along the way.
            </p>
          </section>

          {/* Current work */}
          <section className={styles.currentWork}>
            <h2 className={styles.sectionTitle}>What I&apos;m Building</h2>
            <div className={styles.project}>
              <h3 className={styles.projectName}>
                <a
                  href="https://koucai.chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.projectLink}
                >
                  koucai.chat
                </a>
              </h3>
              <p className={styles.projectDescription}>
                A Chinese learning app built with frontier AI. Helps learners practice
                conversations with adaptive AI tutors and build vocabulary with spaced
                repetition.
              </p>
            </div>
          </section>

          {/* Blog CTA */}
          <section className={styles.blog}>
            <h2 className={styles.sectionTitle}>Writing</h2>
            <p className={styles.blogDescription}>
              Monthly posts about AI-assisted development, product engineering, and lessons
              learned shipping real applications.
            </p>
            <Link href="/blog" className={styles.blogLink}>
              Read the blog
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
