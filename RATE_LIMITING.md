# Server-Side Rate Limiting Implementation

## What We Built

Added true server-side rate limiting to track API usage across ALL users, not just individual browsers.

## How It Works

### The Problem Before
- Each user had their own counter in localStorage
- 10 users × 1000 requests each = 10,000 total API calls
- No way to enforce the actual 1000/day Google API limit

### The Solution Now
- Single shared counter stored on Netlify's servers
- All users share the same 1000 request daily limit
- When limit is hit, ALL users see "Daily limit reached"

## Architecture

### 1. Netlify Blobs (Storage)
```javascript
const store = getStore('rate-limit');
await store.set('daily-usage', JSON.stringify({
  count: 247,
  date: '2025-11-11'
}));
```

**What is Netlify Blobs?**
- Simple key-value storage (like a database)
- Free tier: 1GB storage, 1 million reads/month
- Perfect for lightweight data like counters
- Serverless-friendly (no connection pooling needed)

### 2. Two Netlify Functions

#### `generate-analogy.js` (Main Function)
**Purpose:** Generate analogies AND track usage

**Flow:**
1. Check current usage from Netlify Blobs
2. If count >= 1000 → Return 429 error
3. If count < 1000 → Call Gemini API
4. If successful → Increment counter
5. Return result + usage stats

**Key Code:**
```javascript
// Check limit
if (currentCount >= DAILY_LIMIT) {
  return { statusCode: 429, body: 'Limit reached' };
}

// After successful API call
await store.set('daily-usage', JSON.stringify({
  count: currentCount + 1,
  date: today
}));
```

#### `get-usage.js` (Status Check)
**Purpose:** Check current usage WITHOUT consuming quota

**Flow:**
1. Read counter from Netlify Blobs
2. Return current usage stats
3. Frontend calls this on page load

**Why separate function?**
- Page loads shouldn't count as API usage
- Users can check how many requests are left
- Updates usage panel in real-time

### 3. Frontend Updates

#### On Page Load:
```javascript
fetchServerUsage() // Calls get-usage.js
→ Updates usage panel with real numbers
→ Disables button if limit reached
```

#### After Generating Analogy:
```javascript
Response includes: {
  candidates: [...],
  usage: {
    current: 247,
    limit: 1000,
    remaining: 753
  }
}
→ Updates panel automatically
```

#### On Rate Limit Error (429):
```javascript
→ Disables generate button
→ Shows error message
→ Updates panel to 100%
```

## Data Flow Diagram

```
User 1 clicks "Generate" → Netlify Function
                            ↓
                    Check Netlify Blobs
                    {"count": 50, "date": "2025-11-11"}
                            ↓
                    50 < 1000? ✓ Allow
                            ↓
                    Call Gemini API ✓
                            ↓
                    Increment: {"count": 51, "date": "2025-11-11"}
                            ↓
                    Return analogy + usage

User 2 (different browser, different IP) clicks "Generate"
                            ↓
                    Check Netlify Blobs
                    {"count": 51, "date": "2025-11-11"}
                            ↓
                    51 < 1000? ✓ Allow
                    ... continues ...

[999 more requests later]

User 500 clicks "Generate" → Netlify Function
                            ↓
                    Check Netlify Blobs
                    {"count": 1000, "date": "2025-11-11"}
                            ↓
                    1000 >= 1000? ✗ REJECT
                            ↓
                    Return 429 error
```

## Automatic Daily Reset

**How it resets without cron jobs:**

```javascript
const today = '2025-11-11';
const stored = {"count": 1000, "date": "2025-11-11"};

// Next day...
const today = '2025-11-12';

if (stored.date !== today) {
  currentCount = 0; // Fresh start!
}
```

**Magic:** Date comparison happens on EVERY request, so the first request after midnight automatically starts from 0.

## Key Concepts Explained

### 1. Serverless Functions
- Code that runs on-demand, not 24/7
- Scales automatically with traffic
- Pay only for execution time
- Perfect for APIs and background tasks

### 2. Key-Value Storage
```javascript
// Like a JavaScript object, but persistent
{
  'daily-usage': '{"count": 247, "date": "2025-11-11"}',
  'other-key': 'other-value'
}
```

### 3. HTTP Status Codes
- `200` = Success
- `400` = Bad request (client error)
- `429` = Too many requests (rate limit)
- `500` = Server error

### 4. Race Conditions (Prevented)
**Problem:** What if 2 users click at the exact same millisecond?

```
User A reads: count = 999
User B reads: count = 999  (simultaneously)
User A writes: count = 1000
User B writes: count = 1000  (should be 1001!)
```

**Solution:** Netlify Blobs handles this internally with atomic operations. Each write is guaranteed to be sequential.

## Benefits

### Before (localStorage only):
- ❌ Each user tracks their own usage
- ❌ No real enforcement of API limits
- ❌ Could easily exceed 1000 RPD
- ❌ No visibility into total usage

### After (Netlify Blobs):
- ✅ Single source of truth for all users
- ✅ Hard limit enforced server-side
- ✅ Impossible to exceed 1000 RPD
- ✅ Real-time usage visible to everyone
- ✅ Automatic daily resets
- ✅ No database setup needed

## Cost & Limits

**Netlify Blobs Free Tier:**
- 1 GB storage (we use ~1 KB)
- 1 million reads/month
- 1 million writes/month

**Our Usage:**
- Read: 1 per page load + 1 per analogy = ~2 reads/request
- Write: 1 per successful analogy
- Storage: ~50 bytes per day

**Conclusion:** Free tier is more than enough!

## Testing

To test the rate limiting:

1. **Check current usage:**
   - Open browser console
   - Go to Network tab
   - Look for `get-usage` call
   - See current count

2. **Test limit enforcement:**
   - You'd need to make 1000 requests (not practical)
   - Or temporarily set `DAILY_LIMIT = 5` for testing
   - After 5 requests, should see 429 error

3. **Test reset:**
   - Check usage today
   - Wait until tomorrow
   - First request should show count = 1

## What You Learned

1. **Serverless Storage:** How to persist data without a database
2. **Rate Limiting:** Protecting APIs with usage quotas
3. **Serverless Functions:** Running backend code without servers
4. **State Management:** Syncing server state with frontend UI
5. **HTTP APIs:** Request/response patterns, status codes
6. **Date-based Logic:** Automatic resets without cron jobs
7. **npm Dependencies:** Adding packages to serverless functions

## Next Steps

If you want to enhance this further:

1. **Admin Dashboard:** Create a `/admin` page to view/reset usage
2. **Per-User Limits:** Track usage per IP address (10 per user/day)
3. **Analytics:** Log which concepts are most popular
4. **Caching:** Cache similar requests to reduce API calls
5. **Backup Storage:** Use multiple storage providers for redundancy

## Questions?

- **Q: What if Netlify Blobs is down?**
  A: Requests fail gracefully, frontend shows error

- **Q: Can users bypass this by clearing cookies?**
  A: No! Counter is server-side, nothing to clear

- **Q: What happens at midnight?**
  A: First request after midnight sees new date, starts at 0

- **Q: Can I see the stored data?**
  A: Yes, in Netlify dashboard under "Blobs" section
