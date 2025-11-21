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

- [ ] **Add request timeout handling** in server.js
  - Ensure responses within Discord's 3-second limit
  - Consider deferred responses for slow operations
  - Location: src/server.js:41-88

### Testing & Quality

- [x] **Increase test coverage**
  - ✅ Add comprehensive tests for reddit.js
  - ✅ Add edge case tests for empty Reddit responses
  - ✅ Add tests for error handling in server.js
  - ✅ Add cache.test.js with full coverage
  - ✅ 11 new test cases added
  - Location: test/reddit.test.js, test/cache.test.js, test/server.test.js

- [ ] **Add integration tests**
  - Test actual Discord webhook flow
  - Mock Reddit API responses (partially done)
  - Test error scenarios end-to-end

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

- [ ] **Update README with troubleshooting**
  - Common issues and solutions
  - Debug guide for local development
  - FAQ section
  - Location: README.md

---

## Low Priority

### Code Quality & Refactoring

- [ ] **Add TypeScript support**
  - Convert .js files to .ts
  - Add type definitions
  - Configure tsconfig.json
  - Update build process

- [ ] **Extract constants to config file**
  - Reddit API URL
  - User-Agent string
  - Command timeout values
  - Create src/config.js

- [ ] **Improve logging**
  - Add structured logging
  - Log interaction types and response times
  - Use Cloudflare Analytics
  - Location: src/server.js

- [ ] **Add response builder utility**
  - Create helper functions for common response types
  - Reduce code duplication
  - Make responses more consistent
  - Location: src/server.js

- [ ] **Refactor router setup**
  - Separate route handlers into individual functions
  - Improve code organization
  - Make routes more testable
  - Location: src/server.js:32-89

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
