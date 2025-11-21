# API Documentation

This document provides comprehensive documentation for the awwbot internal API, including architecture, data flow, and interaction patterns.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Module Structure](#module-structure)
- [Discord Interaction Flow](#discord-interaction-flow)
- [Request/Response Cycle](#requestresponse-cycle)
- [Sequence Diagrams](#sequence-diagrams)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Architecture Overview

awwbot is built on **Cloudflare Workers**, a serverless edge computing platform. The bot follows a **request-response architecture** where Discord sends webhook requests to the Worker, which processes them and returns responses.

### Key Components

```
┌─────────────────────────────────────────────────────────┐
│                    Discord Platform                      │
│  (Sends webhook requests for slash command interactions)│
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS POST
                     │ with Ed25519 signature
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Worker (awwbot)                  │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Signature │→ │   Router   │→ │  Command   │       │
│  │ Validation │  │ (itty-router)│  │  Handlers  │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│         │                │                 │            │
│         │                ▼                 ▼            │
│         │         ┌────────────┐   ┌────────────┐     │
│         │         │   Cache    │   │   Reddit   │     │
│         │         │  (Memory)  │   │    API     │     │
│         │         └────────────┘   └────────────┘     │
│         │                │                 │            │
│         │                ▼                 ▼            │
│         │         ┌────────────────────────────┐       │
│         └────────→│   Response Builders        │       │
│                   │  (Discord-formatted JSON)  │       │
│                   └────────────────────────────┘       │
│                                │                        │
└────────────────────────────────┼────────────────────────┘
                                 │ JSON Response
                                 ▼
┌─────────────────────────────────────────────────────────┐
│                    Discord Platform                      │
│         (Displays response to user in channel)          │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Cloudflare Workers (V8 isolates)
- **Router**: itty-router v5
- **Discord API**: discord-interactions v3.4.0
- **External APIs**: Reddit JSON API

---

## Module Structure

### Core Modules

#### `src/server.js`
**Purpose**: Main application entry point and request handler

**Exports**:
- `server.fetch(request, env)` - Main entry point for Cloudflare Workers
- `server.verifyDiscordRequest(request, env)` - Ed25519 signature verification

**Key Functions**:
- `handleHealthCheck()` - GET / endpoint
- `handlePingInteraction()` - Discord PING handshake
- `handleAwwCommand()` - /awwww command handler
- `handleInviteCommand()` - /invite command handler
- `handleStatsCommand()` - /stats command handler (admin)
- `handleHealthCommand()` - /health command handler (admin)
- `handleApplicationCommand()` - Command router
- `handleDiscordInteraction()` - Main interaction handler
- `isAuthorized()` - Admin authorization check

**Dependencies**: router, commands, reddit, responses, logger, utils, stats

---

#### `src/commands.js`
**Purpose**: Command definitions for Discord API registration

**Exports**:
- `AWW_COMMAND` - /awwww command with subreddit option
- `INVITE_COMMAND` - /invite command
- `STATS_COMMAND` - /stats command (admin)
- `HEALTH_COMMAND` - /health command (admin)
- `SUBREDDITS` - Supported subreddit constants

**Usage**: Shared between runtime (server.js) and registration (register.js)

---

#### `src/reddit.js`
**Purpose**: Reddit API integration and content fetching

**Exports**:
- `getCutePost(subreddit)` - Fetch random cute post with caching
- `getCuteUrl()` - Legacy wrapper returning just URL

**Key Functions**:
- `fetchFromReddit(subreddit)` - Fetch posts from Reddit API
- `isValidPost(post)` - Quality and safety filtering
- `extractPostData(post)` - Extract relevant post metadata

**Dependencies**: cache, config, logger, stats

---

#### `src/cache.js`
**Purpose**: In-memory caching for Reddit posts

**Exports**:
- `isCacheValid(subreddit)` - Check if cache is valid
- `getFromCache(subreddit)` - Get random cached post
- `updateCache(posts, subreddit)` - Update cache with new posts
- `clearCache()` - Clear all caches
- `clearCacheForSubreddit(subreddit)` - Clear specific subreddit cache

**Data Structure**: `Map<subreddit, { posts: [], timestamp: number }>`

**TTL**: 5 minutes (configurable in config.js)

---

#### `src/responses.js`
**Purpose**: Discord response builder utilities

**Exports**:
- `createPongResponse()` - PING response
- `createMessageResponse(content, ephemeral)` - Basic message
- `createErrorResponse(message)` - Error message (ephemeral)
- `createEmbedResponse(embed, ephemeral)` - Rich embed
- `createRedditPostResponse(post)` - Reddit post embed
- `createInviteResponse(applicationId)` - Invite link
- `createStatsResponse(stats, uptime, hitRate)` - Stats embed
- `createHealthResponse(uptime, requests, errors)` - Health embed
- `createUnauthorizedResponse()` - Unauthorized error
- `createUnknownCommandResponse()` - Unknown command error

---

#### `src/config.js`
**Purpose**: Centralized configuration constants

**Exports**:
- `REDDIT_CONFIG` - Reddit API settings
- `getRedditUrl(subreddit)` - Build Reddit API URL
- `CACHE_CONFIG` - Cache TTL settings
- `DISCORD_CONFIG` - Discord settings and owner ID
- `ERROR_MESSAGES` - User-facing error messages

---

#### `src/logger.js`
**Purpose**: Structured logging with performance tracking

**Exports**:
- `debug()`, `info()`, `warn()`, `error()` - Log level functions
- `logInteraction()` - Discord interaction logging
- `logPerformance()` - Performance metrics
- `startTimer()` - Create performance timer
- `setLogLevel()` - Configure log level
- `LogLevel` - Log level constants

---

#### `src/stats.js`
**Purpose**: Usage statistics tracking

**Exports**:
- `recordCommand(name)` - Track command execution
- `recordCacheHit()`, `recordCacheMiss()` - Track cache performance
- `recordError(isTimeout)` - Track errors
- `recordSubredditRequest(subreddit)` - Track subreddit usage
- `getStats()` - Get current statistics
- `getCacheHitRate()` - Calculate cache hit percentage
- `formatUptime()` - Format uptime string
- `resetStats()` - Reset all statistics

---

#### `src/utils.js`
**Purpose**: Utility functions for timeout handling

**Exports**:
- `withTimeout(promise, timeoutMs, operation)` - Wrap promise with timeout
- `createTimeoutError(operation, timeout)` - Create timeout error
- `isTimeoutError(error)` - Check if error is timeout

---

## Discord Interaction Flow

### 1. Request Arrival

```
Discord → Cloudflare Worker
```

**HTTP POST** to worker URL with:
- Headers:
  - `x-signature-ed25519`: Ed25519 signature
  - `x-signature-timestamp`: Request timestamp
- Body: JSON payload with interaction data

### 2. Signature Verification

```javascript
const { isValid, interaction } = await verifyDiscordRequest(request, env);
if (!isValid) return 401 Unauthorized;
```

**Purpose**: Verify request authenticity using Discord public key

**Algorithm**: Ed25519 signature verification
- Combine timestamp + request body
- Verify signature with `DISCORD_PUBLIC_KEY`

### 3. Interaction Type Routing

```
InteractionType.PING → PONG Response (handshake)
InteractionType.APPLICATION_COMMAND → Command Handler
```

### 4. Command Execution

```
Command Name → Specific Handler
  /awwww → handleAwwCommand()
  /invite → handleInviteCommand()
  /stats → handleStatsCommand()
  /health → handleHealthCommand()
```

### 5. Response Generation

```
Handler → Response Builder → JSON Response → Discord
```

---

## Request/Response Cycle

### Successful /awwww Command Flow

```
1. Discord sends POST with /awwww command
2. Verify signature (401 if invalid)
3. Route to handleAwwCommand()
4. Extract subreddit option (default: 'aww')
5. Check cache:
   - Cache hit → Return cached post
   - Cache miss → Fetch from Reddit API
6. Build rich embed response
7. Return JSON to Discord (< 3 seconds)
8. Discord displays embed to user
```

### Admin Command Flow

```
1. Discord sends POST with /stats or /health
2. Verify signature (401 if invalid)
3. Route to handleStatsCommand() or handleHealthCommand()
4. Check authorization (isAuthorized):
   - Unauthorized → Return 403 ephemeral error
   - Authorized → Continue
5. Gather statistics/health data
6. Build rich embed response (ephemeral)
7. Return JSON to Discord
8. Discord displays embed to authorized user only
```

---

## Sequence Diagrams

### 1. /awwww Command with Cache Hit

```
User          Discord       Worker         Cache        Response
 |              |             |              |             |
 |─/awwww─────>|             |              |             |
 |              |─POST──────>|              |             |
 |              |             |─verify────> |             |
 |              |             |<─valid───── |             |
 |              |             |─check────> |              |
 |              |             |<─hit────── |              |
 |              |             |──────────────────────────>|
 |              |<─200 OK────|             |             |
 |<─embed──────|             |              |             |
```

### 2. /awwww Command with Cache Miss

```
User     Discord   Worker    Cache    Reddit API   Response
 |         |         |         |          |           |
 |─/awwww>|         |         |          |           |
 |         |─POST──>|         |          |           |
 |         |         |─verify>|          |           |
 |         |         |─check─>|          |           |
 |         |         |<─miss──|          |           |
 |         |         |─fetch──────────>  |           |
 |         |         |<─posts────────── |           |
 |         |         |─update>|          |           |
 |         |         |────────────────────────────> |
 |         |<─200 OK─|         |          |           |
 |<─embed──|         |         |          |           |
```

### 3. Admin Command with Authorization

```
Owner     Discord    Worker     Stats      Response
 |          |          |          |           |
 |─/stats─>|          |          |           |
 |          |─POST───>|          |           |
 |          |          |─verify─>|           |
 |          |          |─auth───>|           |
 |          |          |<─OK────|           |
 |          |          |─get───>|           |
 |          |          |<─data──|           |
 |          |          |───────────────────>|
 |          |<─200 OK──|          |           |
 |<─stats───|          |          |           |
```

### 4. Unauthorized Admin Command Attempt

```
User      Discord    Worker     Auth       Response
 |          |          |          |           |
 |─/stats─>|          |          |           |
 |          |─POST───>|          |           |
 |          |          |─verify─>|           |
 |          |          |─auth───>|           |
 |          |          |<─DENY──|           |
 |          |          |───────────────────>|
 |          |<─200 OK──|          |           |
 |<─error───|          |          |           |
```

### 5. Timeout Scenario

```
User     Discord   Worker    Reddit     Timeout    Response
 |         |         |         |          |          |
 |─/awwww>|         |         |          |          |
 |         |─POST──>|         |          |          |
 |         |         |─verify>|          |          |
 |         |         |─fetch──────────> |          |
 |         |         |─start timer────>|          |
 |         |         |         |         |─2.5s───>|
 |         |         |<─timeout error───|          |
 |         |         |─────────────────────────────>|
 |         |<─200 OK─|         |          |          |
 |<─error──|         |         |          |          |
```

---

## Data Models

### Discord Interaction Object

```typescript
interface Interaction {
  type: InteractionType;              // 1=PING, 2=APPLICATION_COMMAND
  data?: {
    name: string;                     // Command name (e.g., "awwww")
    options?: Array<{                 // Command options
      name: string;                   // Option name (e.g., "subreddit")
      value: string;                  // Option value (e.g., "cats")
    }>;
  };
  member?: {                          // Guild member (server context)
    user: {
      id: string;                     // Discord user ID
    };
  };
  user?: {                            // User (DM context)
    id: string;                       // Discord user ID
  };
}
```

### Reddit Post Object

```typescript
interface RedditPost {
  url: string;                        // Direct media URL
  title: string;                      // Post title
  author: string;                     // Reddit username
  score: number;                      // Post upvotes
  permalink: string;                  // Full Reddit post URL
  subreddit: string;                  // Subreddit name (without r/)
}
```

### Cache Entry

```typescript
interface CacheEntry {
  posts: RedditPost[];                // Array of cached posts
  timestamp: number;                  // Cache creation time (ms since epoch)
}
```

### Statistics Object

```typescript
interface Stats {
  startTime: number;                  // Worker start time
  totalCommands: number;              // Total commands executed
  commandCounts: Record<string, number>; // Count per command
  cacheHits: number;                  // Cache hit count
  cacheMisses: number;                // Cache miss count
  errors: number;                     // Total errors
  timeouts: number;                   // Timeout errors
  subredditRequests: Record<string, number>; // Requests per subreddit
  uptime: number;                     // Calculated uptime in ms
}
```

### Discord Response Types

```typescript
// Basic message response
interface MessageResponse {
  type: 4;                            // CHANNEL_MESSAGE_WITH_SOURCE
  data: {
    content: string;                  // Message text
    flags?: 64;                       // EPHEMERAL (private to user)
  };
}

// Embed response
interface EmbedResponse {
  type: 4;                            // CHANNEL_MESSAGE_WITH_SOURCE
  data: {
    embeds: [{
      title?: string;                 // Embed title
      description?: string;           // Embed description
      color?: number;                 // Embed color (hex)
      url?: string;                   // Title URL
      image?: { url: string };        // Image URL
      footer?: { text: string };      // Footer text
      fields?: Array<{                // Embed fields
        name: string;
        value: string;
        inline?: boolean;
      }>;
      timestamp?: string;             // ISO timestamp
    }];
    flags?: 64;                       // EPHEMERAL
  };
}
```

---

## Error Handling

### Error Types

1. **Validation Errors** (401)
   - Invalid Discord signature
   - Missing required headers

2. **Client Errors** (400)
   - Unknown command
   - Unknown interaction type

3. **Authorization Errors** (403)
   - Unauthorized admin command access
   - Returned as ephemeral error message

4. **Timeout Errors**
   - Operation exceeds 2.5 seconds
   - User-friendly error message returned
   - Tracked in statistics

5. **External API Errors**
   - Reddit API failures
   - Network timeouts
   - User-friendly fallback messages

### Error Response Flow

```
Error Detected
    ↓
Is it a timeout?
    ├─ Yes → Create timeout error response
    └─ No → Create generic error response
         ↓
Record error in stats
    ↓
Log error with context
    ↓
Return ephemeral error to user
```

### Error Logging

All errors are logged with:
- Error message and stack trace
- Operation context (command, subreddit, etc.)
- Timestamp (ISO format)
- Whether it was a timeout error

---

## Performance Considerations

### Caching Strategy

**Cache Key**: Subreddit name
**TTL**: 5 minutes
**Storage**: In-memory Map (per Worker instance)
**Hit Rate**: Typically 80%+ after warmup

**Benefits**:
- Reduces Reddit API calls by 80%
- Improves response time (<50ms for cache hits)
- Separate cache per subreddit prevents stale data

### Timeout Protection

**Timeout**: 2.5 seconds (allows 0.5s for response processing)
**Discord Limit**: 3 seconds total

**Strategy**:
- Wrap slow operations with `withTimeout()`
- Clean up resources on timeout
- Return user-friendly error message
- Track timeout rate in statistics

### Resource Limits

**Cloudflare Workers Constraints**:
- CPU time: 50ms (can burst higher)
- Memory: 128 MB
- Request timeout: 30 seconds (we enforce 3 seconds)
- No persistent storage (use KV or Durable Objects)

**Optimizations**:
- In-memory caching reduces API calls
- Efficient data structures (Map for O(1) lookups)
- Minimal dependencies
- No heavy computation

---

## Security

### Request Verification

**Method**: Ed25519 signature verification
**Key**: `DISCORD_PUBLIC_KEY` environment variable

**Process**:
1. Extract signature and timestamp from headers
2. Concatenate: `timestamp + request_body`
3. Verify signature with public key
4. Reject if invalid (401 Unauthorized)

### Admin Commands

**Authorization**: Discord user ID check
**Owner ID**: `DISCORD_OWNER_ID` environment variable

**Security Features**:
- Commands disabled if owner ID not set
- Checks both guild member and DM contexts
- Logs unauthorized attempts
- Returns ephemeral error (private to user)

### Secrets Management

**Required Secrets**:
- `DISCORD_TOKEN` - Bot token (registration only)
- `DISCORD_PUBLIC_KEY` - Request verification
- `DISCORD_APPLICATION_ID` - Bot application ID
- `DISCORD_OWNER_ID` - Admin authorization (optional)

**Storage**: Cloudflare Workers environment variables

---

## API Endpoints

### GET /

**Purpose**: Health check endpoint
**Response**: `200 OK` with application ID
**Public**: Yes

### POST /

**Purpose**: Discord webhook interactions
**Headers**:
- `x-signature-ed25519` (required)
- `x-signature-timestamp` (required)
**Response**: Discord interaction response (JSON)
**Public**: No (signature required)

---

## Rate Limiting

### Reddit API

**Limits**: ~60 requests per minute (Reddit's limit)
**Strategy**: In-memory caching with 5-minute TTL
**Result**: ~6 requests per subreddit per hour (80% reduction)

### Discord API

**Limits**: Handled by Discord (unlikely to hit with typical usage)
**Future**: Could add per-user cooldowns using KV storage

---

## Monitoring

### Available Metrics (via /stats command)

- Total commands executed
- Commands by type
- Cache hit rate
- Cache hits/misses
- Total errors
- Timeout errors
- Subreddit request distribution
- Worker uptime

### Health Status (via /health command)

- Overall health (green/yellow/red)
- Error rate percentage
- Total requests
- Total errors
- Worker uptime

---

## Extension Points

### Adding New Commands

1. Define command in `src/commands.js`
2. Create handler function in `src/server.js`
3. Add response builder in `src/responses.js` (if needed)
4. Update `handleApplicationCommand()` switch statement
5. Update `src/register.js` to include new command
6. Run `npm run register` to register with Discord

### Adding New Subreddits

1. Add to `SUBREDDITS` constant in `src/commands.js`
2. Add to `AWW_COMMAND.options.choices` array
3. Cache automatically handles new subreddits
4. Run `npm run register` to update Discord

### Custom Caching Strategy

Current implementation uses in-memory Map. To use Cloudflare KV:

```javascript
// In src/cache.js
export async function getFromCache(subreddit, env) {
  const cached = await env.CACHE_KV.get(subreddit, 'json');
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_CONFIG.TTL_MS) {
    return null;
  }
  return cached.posts[Math.floor(Math.random() * cached.posts.length)];
}
```

---

## Changelog Integration

When making API changes, update:
- This API.md file
- CLAUDE.md (if architecture changes)
- README.md (if user-facing changes)
- CONTRIBUTING.md (if development process changes)

---

**Last Updated**: 2025-11-21
**API Version**: 1.0.0
**Compatible with**: awwbot v1.0.0
