# Google Custom Search API

> Comprehensive guide to implementing Google Custom Search for web scanning and content discovery.

---

## Overview

**Google Custom Search Engine (CSE)** provides programmatic access to Google Search results. In this project, it's used to:
- Scan the web for pirated content
- Find unauthorized copies on known piracy domains
- Generate search queries based on content metadata

---

## Why Google CSE?

| Feature | Benefit |
|---------|---------|
| **Comprehensive Coverage** | Access to Google's full web index |
| **Programmable** | JSON API for automation |
| **Configurable** | Restrict to specific sites or search entire web |
| **Rate Limiting** | Built-in quota management |
| **Structured Results** | Title, snippet, URL, domain info |

---

## Setup Guide

### Step 1: Create Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click **Add** to create new search engine
3. Configure:
   - **Sites to search**: Select "Search the entire web"
   - **Search engine name**: "PirateSlayer Scanner"
4. Click **Create**
5. Copy the **Search Engine ID** (cx parameter)

### Step 2: Enable Custom Search API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Custom Search API**:
   - Go to **APIs & Services → Library**
   - Search for "Custom Search API"
   - Click **Enable**

### Step 3: Create API Key

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → API Key**
3. Copy the API key
4. (Optional) Restrict key to Custom Search API only

---

## Environment Variables

```bash
GOOGLE_CSE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
GOOGLE_CSE_ID=XXXXXXXXXXXXXXXXX:XXXXXXXXX
```

---

## API Usage

### Basic Request

```
GET https://www.googleapis.com/customsearch/v1
  ?key={API_KEY}
  &cx={SEARCH_ENGINE_ID}
  &q={QUERY}
  &num=10
```

### Response Structure

```json
{
  "items": [
    {
      "title": "Result Title",
      "link": "https://example.com/page",
      "snippet": "Description snippet...",
      "displayLink": "example.com"
    }
  ],
  "searchInformation": {
    "totalResults": "1234"
  }
}
```

---

## Implementation in This Project

### Scanner Function

```typescript
// src/services/scanners/google-scanner.ts

const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID

interface SearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
}

async function searchGoogle(query: string): Promise<SearchResult[]> {
  if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
    console.warn("Google CSE API not configured")
    return []
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1")
  url.searchParams.set("key", GOOGLE_CSE_API_KEY)
  url.searchParams.set("cx", GOOGLE_CSE_ID)
  url.searchParams.set("q", query)
  url.searchParams.set("num", "10")

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    console.error("Google CSE API error:", response.status)
    return []
  }

  const data = await response.json()
  return data.items || []
}
```

### Search Query Generation

```typescript
// Content-type aware queries
const VIDEO_SEARCH_TEMPLATES = [
  '"{title}" course download mp4',
  '"{title}" full course free',
  '"{title}" video torrent',
  '"{title}" 1080p download',
]

const PDF_SEARCH_TEMPLATES = [
  '"{title}" pdf free download',
  '"{title}" ebook download',
  '"{title}" pdf torrent',
  '"{title}" libgen',
]
```

### Rate Limiting

```typescript
// Wait between requests to avoid rate limits
for (const query of queries) {
  const results = await searchGoogle(query)
  // Process results...
  
  // Rate limiting - wait 200ms between queries
  await new Promise(resolve => setTimeout(resolve, 200))
}
```

---

## Quotas & Pricing

### Free Tier

| Limit | Amount |
|-------|--------|
| **Queries per day** | 100 |
| **Queries per 100 seconds** | 100 |

### Paid Tier

| Volume | Price |
|--------|-------|
| First 100 queries/day | Free |
| Up to 10,000 queries/day | $5 per 1,000 queries |
| Over 10,000 queries/day | Contact Google |

### Calculate Cost Example

```
User has Pro plan: 25 content items
Each scan uses ~10 queries per item
Monthly scans: 25 × 10 × 30 = 7,500 queries

Free queries: 100 × 30 = 3,000/month
Paid queries: 7,500 - 3,000 = 4,500
Cost: 4.5 × $5 = $22.50/month
```

---

## Advanced Features

### Site-Restricted Search

Search only within specific domains:

```typescript
// Search only piracy sites
const query = `"${title}" site:1337x.to OR site:thepiratebay.org`
```

### Exclude Original Site

```typescript
// Exclude the legitimate source
const query = `"${title}" -site:teachable.com free download`
```

### Date Restricted Search

```typescript
url.searchParams.set("dateRestrict", "m1")  // Last month
url.searchParams.set("dateRestrict", "w1")  // Last week
```

### File Type Search

```typescript
const query = `"${title}" filetype:pdf`
const query = `"${title}" filetype:mp4`
```

---

## Known Piracy Domains Database

The scanner maintains lists of known piracy domains:

### General Piracy Domains
```typescript
const PIRACY_DOMAINS = [
  "courseclub", "freecoursesite", "getfreecourses",
  "1337x", "thepiratebay", "torrentgalaxy",
  "mega.nz", "telegram"
]
```

### Video-Specific Domains
```typescript
const VIDEO_PIRACY_DOMAINS = [
  "yts", "rarbg", "fmovies", "123movies", "putlocker"
]
```

### PDF-Specific Domains
```typescript
const PDF_PIRACY_DOMAINS = [
  "libgen", "sci-hub", "z-lib", "pdfdrive", "ebookee"
]
```

---

## Error Handling

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `400` | Invalid request | Check query format |
| `403` | API key invalid/disabled | Verify key in Cloud Console |
| `429` | Quota exceeded | Wait or upgrade quota |
| `500` | Google server error | Retry with backoff |

### Retry Logic

```typescript
async function searchWithRetry(query: string, maxRetries = 3): Promise<SearchResult[]> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await searchGoogle(query)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
  return []
}
```

---

## Testing

### Verify API Key

```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_CX&q=test"
```

### Expected Response

```json
{
  "kind": "customsearch#search",
  "items": [...]
}
```

---

## Alternatives

If Google CSE doesn't meet your needs:

| Service | Pros | Cons |
|---------|------|------|
| **Bing Web Search API** | Good coverage, Azure integration | Different result quality |
| **SerpAPI** | Easy to use, multiple engines | More expensive |
| **Brave Search API** | Privacy-focused | Smaller index |
| **ScrapingBee** | Actual Google results | Higher cost, slower |

---

## Resources

- [Programmable Search Engine](https://programmablesearchengine.google.com/)
- [Custom Search JSON API](https://developers.google.com/custom-search/v1/overview)
- [API Reference](https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list)
- [Quota & Pricing](https://developers.google.com/custom-search/v1/overview#pricing)

---

*Last updated: January 2026*
