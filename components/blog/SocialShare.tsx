// ABOUTME: Social sharing buttons for blog posts with browser API fallbacks
// ABOUTME: Enables sharing to Twitter, LinkedIn, and copying post URL

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './SocialShare.module.css';

interface Post {
  title: string;
  slug: string;
}

interface SocialShareProps {
  post: Post;
}

export default function SocialShare({ post }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const pathname = usePathname();

  // Compute URL client-side to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  // Don't render until URL is available
  if (!url) return null;

  const shareToTwitter = () => {
    const text = `${post.title} by Ben Redmond`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    // Try popup, fallback if blocked
    const popup = window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Popup blocked - redirect in same window as fallback
      window.location.href = twitterUrl;
    }
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

    // Try popup, fallback if blocked
    const popup = window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = linkedInUrl;
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert(`Failed to copy URL. Please copy manually: ${url}`);
    }
  };

  return (
    <div className={styles.socialShare}>
      <p className={styles.label}>Share this post:</p>
      <div className={styles.buttons}>
        <button
          onClick={shareToTwitter}
          className={styles.shareButton}
          aria-label={`Share "${post.title}" on Twitter`}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter
        </button>
        <button
          onClick={shareToLinkedIn}
          className={styles.shareButton}
          aria-label={`Share "${post.title}" on LinkedIn`}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
          </svg>
          LinkedIn
        </button>
        <button
          onClick={copyToClipboard}
          className={`${styles.shareButton} ${copied ? styles.copied : ''}`}
          aria-label="Copy URL to clipboard"
        >
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            {copied ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            )}
          </svg>
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
      </div>
    </div>
  );
}
