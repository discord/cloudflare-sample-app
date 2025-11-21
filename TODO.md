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

- [ ] **Update itty-router** from 4.0.13 to 5.0.22
  - Review migration guide for v5
  - Update router syntax if breaking changes
  - Test all routes after upgrade
  - Location: package.json:23

- [ ] **Add rate limiting** to Reddit API calls
  - Prevent hitting Reddit API limits
  - Implement caching for r/aww posts
  - Consider using Cloudflare KV for cache storage
  - Location: src/reddit.js

- [ ] **Improve error handling** in getCuteUrl()
  - Handle Reddit API failures gracefully
  - Add fallback response when no posts found
  - Handle network timeouts
  - Return user-friendly error messages
  - Location: src/reddit.js:7-29

- [ ] **Add request timeout handling** in server.js
  - Ensure responses within Discord's 3-second limit
  - Consider deferred responses for slow operations
  - Location: src/server.js:41-88

### Testing & Quality

- [ ] **Increase test coverage**
  - Add tests for reddit.js (currently untested)
  - Add edge case tests for empty Reddit responses
  - Add tests for malformed Discord requests
  - Target: >80% code coverage
  - Location: test/

- [ ] **Add integration tests**
  - Test actual Discord webhook flow
  - Mock Reddit API responses
  - Test error scenarios end-to-end

- [ ] **Add ESLint security plugin**
  - Install eslint-plugin-security
  - Configure security rules
  - Fix any identified issues
  - Location: .eslintrc.json

---

## Medium Priority

### Features & Enhancements

- [ ] **Add command options** to /awwww
  - Allow users to specify subreddit (r/aww, r/eyebleach, r/rarepuppers)
  - Add filter options (images only, videos only, both)
  - Update command definition with options
  - Location: src/commands.js, src/server.js

- [ ] **Implement post caching**
  - Cache Reddit posts in Cloudflare KV
  - Refresh cache periodically
  - Reduce Reddit API calls
  - Improve response time
  - Location: src/reddit.js

- [ ] **Add cooldown per user**
  - Prevent spam of /awwww command
  - Store last usage timestamp per user
  - Use Cloudflare KV or Durable Objects
  - Return friendly cooldown message

- [ ] **Add admin commands**
  - /stats - Show bot usage statistics
  - /health - Show bot health and uptime
  - Restrict to bot owner only

- [ ] **Improve Reddit post filtering**
  - Filter out NSFW posts (safety check)
  - Filter out removed/deleted posts
  - Prefer high-quality images
  - Handle crosspost scenarios
  - Location: src/reddit.js:14-25

- [ ] **Add embed support**
  - Return rich embeds instead of plain URLs
  - Include post title, author, score
  - Better visual presentation
  - Location: src/server.js:62-68

### Documentation

- [ ] **Add JSDoc comments** to all functions
  - server.js functions need documentation
  - Add parameter and return type annotations
  - Location: src/server.js, src/reddit.js

- [ ] **Create CONTRIBUTING.md**
  - Guidelines for contributors
  - Code style requirements
  - PR process
  - Testing requirements

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

*No completed tasks yet - this is a new TODO file*

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
