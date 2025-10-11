#!/usr/bin/env node

/**
 * Blog posts validation script
 * Validates data/blog-posts.json for structural integrity
 * Run this before committing changes to catch errors early
 *
 * Usage: node scripts/validate-blog.js
 */

const fs = require('fs');
const path = require('path');

const BLOG_POSTS_PATH = path.join(__dirname, '..', 'data', 'blog-posts.json');

// Required fields for each blog post
const REQUIRED_FIELDS = [
  'id',
  'slug',
  'title',
  'excerpt',
  'content',
  'category',
  'author',
  'date',
  'readTime',
];

/**
 * Validate that a value is not empty/null/undefined
 */
function isPresent(value) {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Validate slug format (lowercase alphanumeric with hyphens)
 */
function isValidSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Validate date is ISO 8601 format
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('T');
}

/**
 * Main validation function
 */
function validateBlogPosts() {
  try {
    // Check if file exists
    if (!fs.existsSync(BLOG_POSTS_PATH)) {
      console.error(`❌ Error: ${BLOG_POSTS_PATH} not found`);
      process.exit(1);
    }

    // Read and parse JSON
    const fileContent = fs.readFileSync(BLOG_POSTS_PATH, 'utf8');
    let posts;

    try {
      posts = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('Check for syntax errors in blog-posts.json (trailing commas, missing brackets, etc.)');
      process.exit(1);
    }

    // Validate it's an array
    if (!Array.isArray(posts)) {
      console.error('❌ Error: blog-posts.json must export an array');
      process.exit(1);
    }

    // Validate each post
    const errors = [];
    const ids = new Set();
    const slugs = new Set();

    posts.forEach((post, index) => {
      const postId = post.title || post.slug || post.id || `index ${index}`;

      // Check required fields
      REQUIRED_FIELDS.forEach((field) => {
        if (!isPresent(post[field])) {
          errors.push(`Post "${postId}": Missing required field "${field}"`);
        }
      });

      // Validate field types and formats
      if (post.id !== undefined && typeof post.id !== 'string' && typeof post.id !== 'number') {
        errors.push(`Post "${postId}": id must be string or number`);
      }

      if (post.slug && !isValidSlug(post.slug)) {
        errors.push(`Post "${postId}": slug must be lowercase alphanumeric with hyphens (got "${post.slug}")`);
      }

      if (post.date && !isValidDate(post.date)) {
        errors.push(`Post "${postId}": date must be ISO 8601 format (e.g., "2025-01-11T00:00:00Z")`);
      }

      if (post.readTime !== undefined && (typeof post.readTime !== 'number' || post.readTime < 1)) {
        errors.push(`Post "${postId}": readTime must be a positive number`);
      }

      if (post.title && post.title.length > 200) {
        errors.push(`Post "${postId}": title exceeds 200 characters`);
      }

      if (post.excerpt && post.excerpt.length > 500) {
        errors.push(`Post "${postId}": excerpt exceeds 500 characters`);
      }

      // Check for duplicates
      if (post.id && ids.has(post.id)) {
        errors.push(`Duplicate post ID: ${post.id}`);
      }
      if (post.id) ids.add(post.id);

      if (post.slug && slugs.has(post.slug)) {
        errors.push(`Duplicate post slug: ${post.slug}`);
      }
      if (post.slug) slugs.add(post.slug);
    });

    // Report results
    if (errors.length > 0) {
      console.error('❌ Blog posts validation failed:\n');
      errors.forEach((error) => console.error(`  - ${error}`));
      console.error(`\n${errors.length} error(s) found in ${posts.length} post(s)`);
      process.exit(1);
    }

    console.log(`✅ Blog posts validated successfully`);
    console.log(`   ${posts.length} post(s) checked`);
    console.log(`   All required fields present`);
    console.log(`   No duplicate IDs or slugs`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run validation
validateBlogPosts();
