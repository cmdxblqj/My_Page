#!/usr/bin/env node
/**
 * build-content.js
 * ──────────────────────────────────────────
 * Scans content/ directory and generates js/data.js
 *
 * Directory → Subpage mapping:
 *   content/archive/*.md   →  STATIC_ARTICLES  (Subpage 2 · Archive · Blue)
 *   content/codex/*.md     →  STATIC_CODEX     (Subpage 3 · Codex  · Green)
 *   content/gallery/*      →  GALLERY_IMAGES   (Subpage 4 · Gallery · Yellow)
 *
 * Run: node scripts/build-content.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT_FILE = path.join(ROOT, 'js', 'data.js');

// ─── Frontmatter Parser ───────────────────────────────────────────

function parseFrontmatter(raw) {
  // Split on --- delimiters. Expect: [ '', frontmatter, body... ]
  const parts = raw.split('---');
  if (parts.length < 3) {
    // No frontmatter found — treat entire file as body
    return { data: {}, body: raw.trim() };
  }

  const fmText = parts[1];
  const body = parts.slice(2).join('---').trim();
  const data = {};

  const lines = fmText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let rawVal = trimmed.slice(colonIdx + 1).trim();

    // Parse array values: [item1, item2, item3]
    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      const inner = rawVal.slice(1, -1).trim();
      if (inner.length === 0) {
        rawVal = [];
      } else {
        rawVal = inner.split(',').map(s => s.trim());
      }
    }

    // Parse quoted strings
    if (typeof rawVal === 'string' && rawVal.startsWith('"') && rawVal.endsWith('"')) {
      rawVal = rawVal.slice(1, -1);
    }
    if (typeof rawVal === 'string' && rawVal.startsWith("'") && rawVal.endsWith("'")) {
      rawVal = rawVal.slice(1, -1);
    }

    data[key] = rawVal;
  }

  return { data, body };
}

// ─── File Helpers ──────────────────────────────────────────────────

function readDirSafe(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

function humanizeFilename(name) {
  // Convert kebab-case / snake_case / camelCase to Title Case
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// ─── Scan .md Articles ─────────────────────────────────────────────

function scanMdArticles(subDir) {
  const dir = path.join(CONTENT_DIR, subDir);
  const files = readDirSafe(dir)
    .filter(f => f.endsWith('.md'))
    .sort(); // deterministic order

  const articles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, body } = parseFrontmatter(raw);

    const article = {
      id: data.id || file.replace(/\.md$/, ''),
      title: data.title || humanizeFilename(file),
      date: data.date || '',
      time: data.time || '',
      cover: data.cover || '📄',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      excerpt: data.excerpt || '',
      content: '\n' + body,  // leading \n matches original format
    };

    articles.push(article);
    console.log(`  ✓ ${subDir}/${file} → ${article.id}`);
  }

  return articles;
}

// ─── Scan Gallery ───────────────────────────────────────────────────

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp']);

function scanGallery() {
  const dir = path.join(CONTENT_DIR, 'gallery');
  const files = readDirSafe(dir);
  const galleryItems = [];

  const jsonFiles = new Map();   // basename → parsed JSON
  const imageFiles = new Set();  // basename (with ext)

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);

    if (ext === '.json') {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        jsonFiles.set(base, JSON.parse(raw));
      } catch (e) {
        console.warn(`  ⚠ Failed to parse ${file}: ${e.message}`);
      }
    } else if (IMAGE_EXTENSIONS.has(ext)) {
      imageFiles.add(file); // store full filename with extension
    }
  }

  const processedIds = new Set();

  // Process JSON files (for remote URLs or metadata overrides)
  for (const [base, meta] of jsonFiles) {
    // Check if there's a matching image file
    const matchingImage = [...imageFiles].find(f => {
      const imgBase = path.basename(f, path.extname(f));
      return imgBase === base;
    });

    const item = {
      id: meta.id || base,
      src: meta.src || (matchingImage ? `content/gallery/${matchingImage}` : ''),
      title: meta.title || humanizeFilename(base),
      sub: meta.sub || `FRAME ${String(galleryItems.length + 1).padStart(3, '0')} · AUTO`,
      caption: meta.caption || '',
    };

    galleryItems.push(item);
    processedIds.add(base);
    console.log(`  ✓ gallery/${base}.json → ${item.id} ${matchingImage ? '(sidecar for ' + matchingImage + ')' : '(remote)'}`);
  }

  // Process image files without JSON sidecar
  for (const imgFile of imageFiles) {
    const ext = path.extname(imgFile);
    const base = path.basename(imgFile, ext);

    if (processedIds.has(base)) continue; // already handled by JSON sidecar

    const idx = galleryItems.length;
    const item = {
      id: base,
      src: `content/gallery/${imgFile}`,
      title: humanizeFilename(base),
      sub: `FRAME ${String(idx + 1).padStart(3, '0')} · AUTO`,
      caption: '',
    };

    galleryItems.push(item);
    processedIds.add(base);
    console.log(`  ✓ gallery/${imgFile} → ${item.id} (auto)`);
  }

  return galleryItems;
}

// ─── Code Generation ────────────────────────────────────────────────

function jsEscape(str) {
  // Escape backticks, backslashes, and ${ for template literal safety
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function formatJsString(str) {
  return '`' + jsEscape(str) + '`';
}

function generateArticleEntry(a) {
  const lines = [];
  lines.push('  {');
  lines.push(`    id: ${formatJsString(a.id)},`);
  lines.push(`    title: ${formatJsString(a.title)},`);
  lines.push(`    date: ${formatJsString(a.date)},`);
  lines.push(`    time: ${formatJsString(a.time)},`);
  lines.push(`    cover: ${formatJsString(a.cover)},`);
  lines.push(`    tags: [${a.tags.map(t => formatJsString(t)).join(', ')}],`);
  lines.push(`    excerpt: ${formatJsString(a.excerpt)},`);
  lines.push(`    content: ${formatJsString(a.content)}`);
  lines.push('  }');
  return lines.join('\n');
}

function generateGalleryEntry(g) {
  const lines = [];
  lines.push('  {');
  lines.push(`    id: ${formatJsString(g.id)},`);
  lines.push(`    src: ${formatJsString(g.src)},`);
  lines.push(`    title: ${formatJsString(g.title)},`);
  lines.push(`    sub: ${formatJsString(g.sub)},`);
  lines.push(`    caption: ${formatJsString(g.caption)}`);
  lines.push('  }');
  return lines.join('\n');
}

function generateDataJs(archiveArticles, codexArticles, galleryImages) {
  const timestamp = new Date().toISOString();
  const archiveCount = archiveArticles.length;
  const codexCount = codexArticles.length;
  const galleryCount = galleryImages.length;

  const lines = [];
  lines.push('// 🤖 Auto-generated by scripts/build-content.js');
  lines.push(`// Generated: ${timestamp}`);
  lines.push(`// Archive (Subpage 2): ${archiveCount} articles from content/archive/`);
  lines.push(`// Codex   (Subpage 3): ${codexCount} articles from content/codex/`);
  lines.push(`// Gallery (Subpage 4): ${galleryCount} images from content/gallery/`);
  lines.push('// ⚠️  DO NOT EDIT THIS FILE MANUALLY — edit the .md / image files instead.');
  lines.push('');
  lines.push('/* ═══════════════════════════════════ STATIC ARTICLES (Archive · Subpage 2) ═══════════════════════════════════ */');
  lines.push('const STATIC_ARTICLES = [');
  if (archiveArticles.length === 0) {
    lines.push('  // No articles yet. Add .md files to content/archive/');
  } else {
    archiveArticles.forEach((a, i) => {
      lines.push(generateArticleEntry(a));
      if (i < archiveArticles.length - 1) lines.push(',');
    });
  }
  lines.push('];');
  lines.push('');
  lines.push('/* ═══════════════════════════════════ STATIC CODEX (Codex · Subpage 3) ═══════════════════════════════════ */');
  lines.push('const STATIC_CODEX = [');
  if (codexArticles.length === 0) {
    lines.push('  // No articles yet. Add .md files to content/codex/');
  } else {
    codexArticles.forEach((a, i) => {
      lines.push(generateArticleEntry(a));
      if (i < codexArticles.length - 1) lines.push(',');
    });
  }
  lines.push('];');
  lines.push('');
  lines.push('/* ═══════════════════════════════════ GALLERY IMAGES (Gallery · Subpage 4) ═══════════════════════════════════ */');
  lines.push('const GALLERY_IMAGES = [');
  if (galleryImages.length === 0) {
    lines.push('  // No images yet. Add image files or .json entries to content/gallery/');
  } else {
    galleryImages.forEach((g, i) => {
      lines.push(generateGalleryEntry(g));
      if (i < galleryImages.length - 1) lines.push(',');
    });
  }
  lines.push('];');

  return lines.join('\n') + '\n';
}

// ─── Main ───────────────────────────────────────────────────────────

function main() {
  console.log('\n🔍 Scanning content/ directory...\n');

  // Ensure output directory exists
  const jsDir = path.join(ROOT, 'js');
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }

  // Scan all content
  console.log('📘 Archive (Subpage 2 · Blue):');
  const archiveArticles = scanMdArticles('archive');
  console.log(`   → ${archiveArticles.length} article(s)\n`);

  console.log('📗 Codex (Subpage 3 · Green):');
  const codexArticles = scanMdArticles('codex');
  console.log(`   → ${codexArticles.length} article(s)\n`);

  console.log('📷 Gallery (Subpage 4 · Yellow):');
  const galleryImages = scanGallery();
  console.log(`   → ${galleryImages.length} image(s)\n`);

  // Generate output
  const output = generateDataJs(archiveArticles, codexArticles, galleryImages);
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log(`✅ Generated: ${path.relative(ROOT, OUTPUT_FILE)}`);
  console.log(`   Archive: ${archiveArticles.length} | Codex: ${codexArticles.length} | Gallery: ${galleryImages.length}\n`);
}

main();
