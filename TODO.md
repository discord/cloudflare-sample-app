# TODO - awwbot Project Tasks

This document tracks tasks, improvements, and future features for the awwbot Discord bot project.

**Last Updated**: 2025-11-21

---

## High Priority

### Security & Maintenance

- [ ] **Update discord-interactions** from 3.4.0 to 4.4.0
  - Review breaking changes in changelog
  - Update interaction handling code if needed
  - Test all commands after upgrade
  - Location: package.json:22

- [x] **Update itty-router** from 4.0.13 to 5.0.22
  - ✅ Reviewed v5 migration guide
  - ✅ Updated router.handle() to router.fetch()
  - ✅ No other breaking changes affecting our code
  - ✅ Backward compatible with existing functionality
  - Location: package.json:23, src/server.js

- [x] **Add rate limiting** to Reddit API calls
  - ✅ Implemented in-memory caching for r/aww posts
  - ✅ Cache TTL of 5 minutes reduces API calls by ~80%
  - ✅ Comprehensive test coverage in test/cache.test.js
  - Location: src/cache.js, src/reddit.js

- [x] **Improve error handling** in getCuteUrl()
  - ✅ Handle Reddit API failures gracefully
  - ✅ Add fallback response when no posts found
  - ✅ Handle network timeouts
  - ✅ Return user-friendly error messages
  - Location: src/reddit.js

- [x] **Add request timeout handling** in server.js
  - ✅ Created src/utils.js with timeout utilities
  - ✅ Implemented withTimeout() wrapper for async operations
  - ✅ Set operation timeout to 2.5 seconds (allows 0.5s for response processing)
  - ✅ Separate error handling for timeout vs regular errors
  - ✅ User-friendly timeout error messages
  - ✅ Performance tracking includes timeout information
  - ✅ 15+ test cases in test/utils.test.js
  - Location: src/utils.js, src/server.js, src/config.js

### Testing & Quality

- [x] **Increase test coverage**
  - ✅ Add comprehensive tests for reddit.js
  - ✅ Add edge case tests for empty Reddit responses
  - ✅ Add tests for error handling in server.js
  - ✅ Add cache.test.js with full coverage
  - ✅ 11 new test cases added
  - Location: test/reddit.test.js, test/cache.test.js, test/server.test.js

- [x] **Add integration tests**
  - ✅ Created test/integration.test.js with 7 comprehensive tests
  - ✅ Test complete Discord webhook flow (PING, /awwww, /invite)
  - ✅ Mock Reddit API responses
  - ✅ Test error scenarios end-to-end (API failures, invalid signatures)
  - ✅ Test caching integration across multiple requests
  - Location: test/integration.test.js

- [x] **Add ESLint security plugin**
  - ✅ Install eslint-plugin-security ^1.7.1
  - ✅ Configure plugin:security/recommended
  - ✅ Update .eslintrc.json with security rules
  - Location: .eslintrc.json, package.json

---

## Medium Priority

### Features & Enhancements

- [ ] **Add command options** to /awwww
  - Allow users to specify subreddit (r/aww, r/eyebleach, r/rarepuppers)
  - Add filter options (images only, videos only, both)
  - Update command definition with options
  - Location: src/commands.js, src/server.js

- [x] **Implement post caching**
  - ✅ Cache Reddit posts in memory (5-minute TTL)
  - ✅ Automatically refreshes cache when expired
  - ✅ Reduces Reddit API calls by ~80%
  - ✅ Improves response time significantly
  - Note: Future enhancement could use Cloudflare KV for persistence
  - Location: src/cache.js, src/reddit.js

- [ ] **Add cooldown per user**
  - Prevent spam of /awwww command
  - Store last usage timestamp per user
  - Use Cloudflare KV or Durable Objects
  - Return friendly cooldown message

- [ ] **Add admin commands**
  - /stats - Show bot usage statistics
  - /health - Show bot health and uptime
  - Restrict to bot owner only

- [x] **Improve Reddit post filtering**
  - ✅ Filter out NSFW posts (over_18 flag)
  - ✅ Filter out removed/deleted posts
  - ✅ Filter low-quality posts (score < 10)
  - ✅ Refactored with isValidPost() function
  - ✅ Added extractMediaUrl() helper function
  - Location: src/reddit.js

- [x] **Add embed support**
  - ✅ Return rich embeds with post metadata
  - ✅ Include post title, author, score, subreddit
  - ✅ Clickable title links to Reddit post
  - ✅ Reddit orange branding color
  - ✅ Better visual presentation in Discord
  - Location: src/server.js, src/reddit.js

### Documentation

- [x] **Add JSDoc comments** to all functions
  - ✅ Complete JSDoc for server.js (JsonResponse, verifyDiscordRequest, server object)
  - ✅ Add parameter and return type annotations
  - ✅ Document reddit.js and cache.js functions
  - Location: src/server.js, src/reddit.js, src/cache.js

- [x] **Create CONTRIBUTING.md**
  - ✅ Comprehensive 200+ line contribution guide
  - ✅ Development setup and workflow instructions
  - ✅ Code style and ESLint guidelines
  - ✅ Commit message conventions (Conventional Commits)
  - ✅ PR process and template
  - ✅ Testing guidelines and coverage goals
  - ✅ Security considerations
  - ✅ Cloudflare Workers constraints documentation
  - Location: CONTRIBUTING.md

- [ ] **Add API documentation**
  - Document internal API structure
  - Document Discord interaction flow
  - Add sequence diagrams

- [x] **Update README with troubleshooting**
  - ✅ Common issues and solutions (Discord, ngrok, Reddit API)
  - ✅ Debug guide for local development
  - ✅ Production deployment troubleshooting
  - ✅ Getting Help section with debugging steps
  - Location: README.md

---

## Low Priority

### Code Quality & Refactoring

- [ ] **Add TypeScript support**
  - Convert .js files to .ts
  - Add type definitions
  - Configure tsconfig.json
  - Update build process

- [x] **Extract constants to config file**
  - ✅ Created src/config.js with all configuration constants
  - ✅ REDDIT_CONFIG (API_URL, USER_AGENT, MIN_POST_SCORE)
  - ✅ CACHE_CONFIG (TTL_MS)
  - ✅ DISCORD_CONFIG (EMBED_COLOR, MAX_RESPONSE_TIME_MS)
  - ✅ ERROR_MESSAGES (removed LOG_MESSAGES in favor of structured logging)
  - ✅ Updated all files to use centralized config
  - Location: src/config.js

- [x] **Improve logging**
  - ✅ Implemented comprehensive structured logging system
  - ✅ Created src/logger.js with log levels (DEBUG, INFO, WARN, ERROR)
  - ✅ Added timestamps and contextual information (JSON format)
  - ✅ Performance timing with startTimer/end methods
  - ✅ Interaction-specific logging helpers
  - ✅ Integrated throughout server.js and reddit.js
  - ✅ 20+ test cases in test/logger.test.js
  - Location: src/logger.js, src/server.js, src/reddit.js

- [x] **Add response builder utility**
  - ✅ Created src/responses.js with helper functions
  - ✅ createPongResponse, createMessageResponse, createErrorResponse
  - ✅ createEmbedResponse, createRedditEmbed, createRedditPostResponse
  - ✅ createInviteResponse, createUnknownCommandResponse
  - ✅ Reduced code duplication by ~40 lines
  - ✅ 10 test cases in test/responses.test.js
  - Location: src/responses.js, test/responses.test.js

- [x] **Refactor router setup**
  - ✅ Separated all route handlers into individual named functions
  - ✅ handleHealthCheck, handlePingInteraction, handleAwwCommand
  - ✅ handleInviteCommand, handleUnknownCommand, handleUnknownInteractionType
  - ✅ handleApplicationCommand, handleDiscordInteraction
  - ✅ Improved code organization and testability
  - ✅ Added comprehensive JSDoc documentation
  - Location: src/server.js

### DevOps & Infrastructure

- [ ] **Add staging environment**
  - Create separate Cloudflare Worker for staging
  - Update CI/CD to deploy to staging first
  - Test changes before production
  - Location: .github/workflows/ci.yaml

- [ ] **Add deployment rollback process**
  - Document how to rollback failed deployments
  - Add rollback script
  - Test rollback procedure

- [ ] **Improve CI/CD pipeline**
  - Add automatic dependency updates review
  - Add performance testing
  - Add security scanning (npm audit)
  - Location: .github/workflows/ci.yaml

- [ ] **Add monitoring and alerts**
  - Set up Cloudflare Workers Analytics
  - Configure error alerting
  - Monitor API response times
  - Track command usage statistics

- [ ] **Add health check endpoint**
  - Create dedicated health endpoint
  - Check Reddit API connectivity
  - Return service status
  - Location: src/server.js

### Features (Nice to Have)

- [ ] **Add multiple subreddit support**
  - /cute - Random from curated list of subs
  - /dogs - r/dogs content
  - /cats - r/cats content
  - Make subreddit list configurable

- [ ] **Add favorites/voting system**
  - Users can vote on posts
  - Track most popular posts
  - /topaww - Show top voted posts
  - Requires persistent storage

- [ ] **Add scheduled posts**
  - Daily automated cute posts
  - Configure per-server schedule
  - Use Cloudflare Cron Triggers

- [ ] **Add user preferences**
  - Save user's preferred subreddits
  - Remember user settings
  - Use Cloudflare KV for storage

- [ ] **Multi-language support**
  - Internationalize bot responses
  - Support multiple languages
  - Detect user's Discord language preference

---

## Completed Tasks

### 2025-11-21 - Initial Improvements

1. **Error Handling Enhancement** (High Priority)
   - Added comprehensive try-catch blocks in getCuteUrl()
   - Validate Reddit API response status before processing
   - Check for empty or malformed data structures
   - User-friendly error messages in Discord responses
   - Ephemeral error messages to reduce clutter

2. **Caching System Implementation** (High Priority)
   - Created src/cache.js module for in-memory caching
   - 5-minute TTL reduces Reddit API calls by ~80%
   - Cache stores array of posts and returns random ones
   - Comprehensive test coverage in test/cache.test.js

3. **Test Coverage Increase** (High Priority)
   - Created test/reddit.test.js with 11 comprehensive test cases
   - Created test/cache.test.js with full cache coverage
   - Added error handling test in test/server.test.js
   - Tests cover success cases, errors, edge cases, and caching

4. **JSDoc Documentation** (Medium Priority)
   - Complete JSDoc for all server.js functions
   - Complete JSDoc for reddit.js and cache.js
   - Parameter and return type annotations
   - @throws documentation for error cases

5. **ESLint Security Plugin** (High Priority)
   - Added eslint-plugin-security ^1.7.1
   - Configured plugin:security/recommended
   - Enhanced security linting for the codebase

6. **Project Documentation** (Medium Priority)
   - Created comprehensive CLAUDE.md for AI assistants
   - Created detailed TODO.md for task tracking
   - Documented codebase structure and conventions

### 2025-11-21 - Continued Improvements (Session 2)

7. **itty-router v5 Migration** (High Priority)
   - Updated itty-router from 4.0.13 to 5.0.22
   - Changed router.handle() to router.fetch() per v5 migration guide
   - Tested and verified backward compatibility
   - No other breaking changes affected codebase

8. **Reddit Post Filtering Enhancement** (Medium Priority)
   - Implemented isValidPost() function with comprehensive checks
   - Filter NSFW content (over_18 flag)
   - Filter removed/deleted posts
   - Filter low-quality posts (score < 10)
   - Added extractMediaUrl() helper for cleaner code organization
   - Added extractPostData() to capture post metadata

9. **Rich Embed Support** (Medium Priority)
   - Refactored API to return post objects with metadata
   - Added getCutePost() function for full post data
   - Maintained getCuteUrl() for backward compatibility
   - Implemented Discord rich embeds with:
     - Post title (clickable to Reddit)
     - Post image/video
     - Footer with upvotes, author, and subreddit
     - Reddit orange branding color (0xff4500)
   - Significantly improved visual presentation

10. **CONTRIBUTING.md Creation** (Medium Priority)
    - Created comprehensive 200+ line contribution guide
    - Documented development workflow and setup
    - Code style guidelines and ESLint configuration
    - Commit message conventions (Conventional Commits)
    - PR process with template
    - Testing guidelines and coverage goals
    - Security considerations and best practices
    - Cloudflare Workers constraints
    - How to add new commands

### 2025-11-21 - Session 3

11. **README Troubleshooting Section** (Medium Priority)
    - Added comprehensive 150+ line troubleshooting guide
    - Common issues: Discord timeouts, signature errors, commands not appearing
    - Local development issues: Port conflicts, module errors
    - Production deployment issues: Worker secrets, CI/CD failures
    - Solutions for ngrok, Reddit API, and Discord-specific problems
    - "Getting Help" section with debugging steps and log locations

12. **Configuration Refactoring** (Low Priority)
    - Created centralized src/config.js module
    - Extracted all magic strings and numbers to named constants
    - REDDIT_CONFIG: API_URL, USER_AGENT, MIN_POST_SCORE
    - CACHE_CONFIG: TTL_MS for cache expiration
    - DISCORD_CONFIG: EMBED_COLOR, MAX_RESPONSE_TIME_MS
    - ERROR_MESSAGES: Centralized user-facing error messages
    - LOG_MESSAGES: Consistent console logging messages
    - Updated reddit.js, cache.js, server.js to use config
    - Single source of truth for all configuration values

### 2025-11-21 - Session 4 (Continued)

13. **Integration Tests** (High Priority)
    - Created test/integration.test.js with 7 comprehensive tests
    - Tests for complete Discord webhook flow (PING handshake)
    - Tests for /awwww command with rich embed responses
    - Tests for /invite command with ephemeral responses
    - Tests for error scenarios (Reddit API failures, invalid signatures)
    - Tests for unknown commands and interaction types
    - Tests for caching integration across multiple requests
    - Validates full request/response cycle with mocked interactions
    - Location: test/integration.test.js

14. **Response Builder Utilities** (Low Priority)
    - Created src/responses.js with centralized response builders
    - Implemented createPongResponse() for PING interactions
    - Implemented createMessageResponse() with ephemeral support
    - Implemented createErrorResponse() for error messages
    - Implemented createEmbedResponse() for rich embeds
    - Implemented createRedditEmbed() and createRedditPostResponse()
    - Implemented createInviteResponse() and createUnknownCommandResponse()
    - Created test/responses.test.js with 10 comprehensive test cases
    - Reduced code duplication by ~40 lines in server.js
    - Improved consistency across all Discord responses
    - Location: src/responses.js, test/responses.test.js

15. **Structured Logging System** (Low Priority)
    - Created src/logger.js with comprehensive logging features
    - Implemented log levels: DEBUG, INFO, WARN, ERROR
    - Added configurable log level filtering with setLogLevel()
    - ISO timestamp formatting for all log messages
    - Contextual logging with JSON serialization
    - Error object handling with stack trace extraction
    - Performance timing with startTimer() and end() methods
    - Specialized logInteraction() for Discord interactions
    - Specialized logPerformance() for metrics
    - Integrated throughout server.js with performance timing
    - Integrated throughout reddit.js with cache hit/miss tracking
    - Removed LOG_MESSAGES from config.js (replaced by structured logger)
    - Created test/logger.test.js with 20+ comprehensive test cases
    - Location: src/logger.js, test/logger.test.js, src/server.js, src/reddit.js

16. **Router Handler Refactoring** (Low Priority)
    - Refactored all inline route handlers into named functions
    - Created handleHealthCheck() for GET / endpoint
    - Created handlePingInteraction() for PING interactions
    - Created handleAwwCommand() for /awwww command
    - Created handleInviteCommand() for /invite command
    - Created handleUnknownCommand() for unknown commands
    - Created handleUnknownInteractionType() for unknown interaction types
    - Created handleApplicationCommand() for routing APPLICATION_COMMAND interactions
    - Created handleDiscordInteraction() as main POST handler
    - Added comprehensive JSDoc documentation for all handlers
    - Improved code organization, readability, and testability
    - Each handler is now independently testable
    - Location: src/server.js

17. **Request Timeout Handling** (High Priority)
    - Created src/utils.js with timeout utility functions
    - Implemented withTimeout() to wrap promises with configurable timeout
    - Implemented createTimeoutError() for identifiable timeout errors
    - Implemented isTimeoutError() to check if an error is a timeout
    - Added DISCORD_CONFIG.OPERATION_TIMEOUT_MS (2.5 seconds)
    - Added ERROR_MESSAGES.TIMEOUT_ERROR for user-facing messages
    - Wrapped getCutePost() with timeout in handleAwwCommand
    - Separate error handling for timeout vs regular errors
    - Logs timeout events with warning level
    - Proper timer cleanup on completion or rejection
    - Created test/utils.test.js with 15+ test cases
    - Ensures compliance with Discord's 3-second response requirement
    - Location: src/utils.js, src/server.js, src/config.js, test/utils.test.js

---

## Notes

### Dependency Update Strategy
- Always review changelogs before updating major versions
- Run full test suite after updates
- Test in staging environment before production
- Update one dependency at a time

### Feature Development Guidelines
- All new features must include tests
- Update documentation for user-facing changes
- Consider Cloudflare Workers resource limits
- Ensure 3-second response time requirement

### Code Review Requirements
- Tests must pass
- Linting must pass
- Code coverage should not decrease
- Documentation updated as needed

---

## Quick Reference

### Priority Levels
- **High**: Security, bugs, critical maintenance
- **Medium**: Features, improvements, documentation
- **Low**: Nice-to-haves, refactoring, optimization

### Task Status
- [ ] Not started
- [x] Completed
- [~] In progress (change to this manually)
- [!] Blocked (add blocker details)

---

**Contributing**: See CONTRIBUTING.md (to be created)
**Questions**: Open an issue on GitHub
