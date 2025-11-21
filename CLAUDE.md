# CLAUDE.md - AI Assistant Development Guide

This document provides a comprehensive guide for AI assistants working with the awwbot Discord bot codebase.

## Project Overview

**awwbot** is a Discord bot that brings cute content from r/aww to Discord servers, hosted on Cloudflare Workers. It serves as an example application demonstrating how to build Discord bots on Cloudflare's serverless platform.

### Key Information
- **Name**: awwbot
- **Version**: 1.0.0
- **Platform**: Cloudflare Workers
- **Language**: JavaScript (ES Modules)
- **License**: MIT
- **Author**: Justin Beckwith

## Technology Stack

### Runtime Environment
- **Cloudflare Workers**: Serverless edge computing platform
- **Node.js**: v18+ (for local development and registration script)
- **ES Modules**: Modern JavaScript module system (type: "module")

### Core Dependencies
- **itty-router** (^4.0.13): Lightweight router for handling HTTP requests
- **discord-interactions** (^3.4.0): Discord API interaction handling and verification

### Development Tools
- **Mocha** (^10.2.0): Test framework
- **Chai** (^4.3.7): Assertion library
- **Sinon** (^16.0.0): Mocking and stubbing library
- **c8** (^8.0.0): Code coverage tool
- **ESLint** (^8.41.0): JavaScript linter
- **Prettier** (^3.0.1): Code formatter
- **wrangler** (^3.0.1): Cloudflare Workers CLI tool
- **ngrok** (^5.0.0-beta.2): Tunneling tool for local development
- **dotenv** (^16.0.3): Environment variable management

## Codebase Structure

```
Cloudflare-discordbot/
├── .github/
│   ├── workflows/
│   │   └── ci.yaml              # CI/CD pipeline configuration
│   └── dependabot.yml           # Automated dependency updates
├── src/
│   ├── server.js                # Main application server and routing logic
│   ├── commands.js              # Discord command definitions
│   ├── reddit.js                # Reddit API interaction logic
│   └── register.js              # Command registration script (Node.js)
├── test/
│   └── server.test.js           # Server tests (Mocha + Chai + Sinon)
├── .eslintrc.json               # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── .prettierignore              # Files to exclude from Prettier
├── .gitignore                   # Git ignore patterns
├── example.dev.vars             # Example environment variables template
├── package.json                 # Project dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── wrangler.toml                # Cloudflare Workers configuration
├── LICENSE                      # MIT license
└── README.md                    # User-facing documentation
```

## Key Files Explained

### src/server.js
The core server file that runs on Cloudflare Workers.

**Key Components**:
- `JsonResponse` class: Custom response class for JSON payloads
- `router`: itty-router instance handling all routes
- `verifyDiscordRequest()`: Verifies Discord request signatures using Ed25519
- Main routes:
  - `GET /`: Health check endpoint returning application ID
  - `POST /`: Main Discord interaction endpoint
  - `*`: 404 handler for unknown routes

**Request Flow**:
1. Verify Discord request signature (security check)
2. Handle PING interactions (webhook handshake)
3. Route APPLICATION_COMMAND interactions to appropriate handlers
4. Return JSON responses per Discord API spec

**Location**: src/server.js:1-114

### src/commands.js
Central command metadata definition.

**Exports**:
- `AWW_COMMAND`: /awwww command (posts cute content)
- `INVITE_COMMAND`: /invite command (generates bot invite link)

**Purpose**: Single source of truth for command definitions used by both runtime (server.js) and registration (register.js).

**Location**: src/commands.js:1-15

### src/reddit.js
Reddit API integration for fetching cute content.

**Key Function**:
- `getCuteUrl()`: Fetches hot posts from r/aww, filters for media URLs, returns random result

**Filtering Logic**:
- Excludes gallery posts
- Prioritizes reddit_video URLs (fallback_url)
- Falls back to post URL for images

**Location**: src/reddit.js:1-30

### src/register.js
Node.js script for registering Discord slash commands.

**Purpose**: One-time setup to register commands with Discord API
**Environment**: Node.js (uses node:process and dotenv)
**Configuration**: Loads from .dev.vars file
**API**: Discord API v10 applications endpoint

**Usage**: `npm run register`

**Location**: src/register.js:1-57

### test/server.test.js
Comprehensive test suite for server functionality.

**Test Coverage**:
- GET / route (health check)
- POST / PING interaction (webhook handshake)
- POST / AWW command handling
- POST / INVITE command handling
- Unknown command error handling
- 404 handling

**Mocking Strategy**: Stubs `verifyDiscordRequest` to bypass signature verification in tests

**Location**: test/server.test.js:1-159

### wrangler.toml
Cloudflare Workers configuration.

**Settings**:
- name: "awwbot"
- main: "./src/server.js"
- compatibility_date: "2023-05-18"
- Secrets: DISCORD_TOKEN, DISCORD_PUBLIC_KEY, DISCORD_APPLICATION_ID

**Location**: wrangler.toml:1-9

## Development Workflows

### Initial Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `example.dev.vars` to `.dev.vars`
4. Fill in Discord credentials in `.dev.vars`
5. Register commands: `npm run register`

### Local Development
1. Start Wrangler dev server: `npm run dev` (runs on port 8787)
2. In separate terminal, start ngrok: `npm run ngrok`
3. Copy ngrok HTTPS URL to Discord Developer Portal "Interactions Endpoint URL"
4. Test slash commands in Discord

### Testing
- Run tests: `npm test`
- Coverage is collected via c8
- Tests use Mocha framework with Chai assertions and Sinon for mocking

### Code Quality
- Lint code: `npm run lint`
- Auto-fix issues: `npm run fix`
- Prettier enforces single quotes and consistent formatting

### Deployment
- Manual: `npm run publish` (uses wrangler deploy)
- Automatic: Push to main branch triggers CI/CD pipeline

## Environment Variables

### Required Secrets
All three secrets must be configured for both local development and production:

1. **DISCORD_TOKEN**: Bot token from Discord Developer Portal
2. **DISCORD_PUBLIC_KEY**: Public key for verifying request signatures
3. **DISCORD_APPLICATION_ID**: Application ID from Discord Developer Portal

### Local Development
- File: `.dev.vars` (gitignored)
- Format: KEY-value pairs per line
- Loaded by: wrangler dev (for server) and dotenv (for register script)

### Production (Cloudflare Workers)
Set secrets via wrangler CLI:
```bash
wrangler secret put DISCORD_TOKEN
wrangler secret put DISCORD_PUBLIC_KEY
wrangler secret put DISCORD_APPLICATION_ID
```

## Code Style and Conventions

### ESLint Configuration
- Extends: `eslint:recommended`, `prettier`
- Plugins: `prettier`
- Environment: `serviceworker: true`
- Parser: ES modules, latest ECMAScript version
- Rule: Prettier violations are errors

**Location**: .eslintrc.json:1-18

### Prettier Configuration
- Single quotes: enforced
- Other settings: Prettier defaults

**Location**: .prettierrc.json:1-3

### JavaScript Patterns
1. **ES Modules**: Use import/export syntax
2. **Async/Await**: Preferred over promises and callbacks
3. **Arrow Functions**: Used consistently
4. **Destructuring**: Used for imports and object properties
5. **JSDoc Comments**: Function-level documentation for key functions

### File Organization
- Export constants/functions at module level
- Group related functionality in dedicated files
- Keep files focused on single responsibility

## Discord Interaction Handling

### Interaction Types
1. **PING**: Webhook verification (must respond with PONG)
2. **APPLICATION_COMMAND**: User slash commands

### Response Types
1. **PONG**: For PING interactions
2. **CHANNEL_MESSAGE_WITH_SOURCE**: Standard message response
3. **Flags**: EPHEMERAL for private messages (invite command)

### Security
- All requests verified via Ed25519 signature
- Headers checked: `x-signature-ed25519`, `x-signature-timestamp`
- Invalid signatures return 401

**Location**: src/server.js:91-104

## CI/CD Pipeline

### GitHub Actions Workflow
File: `.github/workflows/ci.yaml`

### Jobs
1. **test**: Runs on all pushes and PRs
   - Node.js 18
   - `npm install` → `npm test`

2. **lint**: Runs on all pushes and PRs
   - Node.js 18
   - `npm install` → `npm run lint`

3. **release**: Runs only on main branch after tests pass
   - Node.js 18
   - `npm install` → `npm run publish`
   - Requires: CF_API_TOKEN, CF_ACCOUNT_ID secrets

### Required Secrets (GitHub)
- `CF_API_TOKEN`: Cloudflare API token
- `CF_ACCOUNT_ID`: Cloudflare account ID

**Location**: .github/workflows/ci.yaml:1-40

## Testing Conventions

### Test Structure
- Framework: Mocha (describe/it blocks)
- Assertions: Chai (expect style)
- Mocking: Sinon (stubs, spies)

### Test Patterns
1. **Setup/Teardown**: Use beforeEach/afterEach for stub management
2. **Request Mocking**: Create minimal request objects with method, url
3. **Environment Mocking**: Pass env object with required variables
4. **Stub Management**: Always restore stubs in afterEach
5. **Response Validation**: Check status, type, content, flags

### Example Test Pattern
```javascript
describe('Feature', () => {
  let stub;

  beforeEach(() => {
    stub = sinon.stub(module, 'function');
  });

  afterEach(() => {
    stub.restore();
  });

  it('should do something', async () => {
    // Arrange
    const request = { method: 'GET', url: new URL('/', 'http://example.com') };
    const env = { DISCORD_APPLICATION_ID: '123' };
    stub.resolves({ data: 'value' });

    // Act
    const response = await server.fetch(request, env);

    // Assert
    expect(response.status).to.equal(200);
  });
});
```

**Location**: test/server.test.js:12-158

## Adding New Commands

### Step-by-Step Process
1. **Define command metadata** in `src/commands.js`:
   ```javascript
   export const NEW_COMMAND = {
     name: 'commandname',
     description: 'What this command does',
   };
   ```

2. **Add handler** in `src/server.js` switch statement (around line 60):
   ```javascript
   case NEW_COMMAND.name.toLowerCase(): {
     // Command logic here
     return new JsonResponse({
       type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
       data: {
         content: 'Response content',
       },
     });
   }
   ```

3. **Export command** in `src/register.js` (line 37):
   ```javascript
   body: JSON.stringify([AWW_COMMAND, INVITE_COMMAND, NEW_COMMAND]),
   ```

4. **Register command** with Discord:
   ```bash
   npm run register
   ```

5. **Add tests** in `test/server.test.js`:
   ```javascript
   it('should handle NEW_COMMAND interaction', async () => {
     // Test implementation
   });
   ```

6. **Update documentation** as needed

## Common Tasks for AI Assistants

### Adding Dependencies
1. Install: `npm install package-name`
2. Update package.json and package-lock.json
3. Import in relevant files
4. Test locally before committing

### Modifying API Integrations
- Reddit API logic: `src/reddit.js`
- Discord API logic: `src/server.js`
- Always handle errors gracefully
- Add appropriate tests

### Debugging
1. **Local development**: Use `console.log` (appears in wrangler dev output)
2. **Production**: Use Cloudflare Workers dashboard logs
3. **Tests**: Use `npm test` with descriptive test names
4. **Linting**: Run `npm run lint` before committing

### Code Review Checklist
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code follows existing style patterns
- [ ] New features have tests
- [ ] Environment variables documented if added
- [ ] README updated if user-facing changes
- [ ] No secrets committed to repository
- [ ] Error handling implemented
- [ ] JSDoc comments added for new functions

## Important Notes for AI Assistants

### Security Considerations
1. **Never commit secrets**: .dev.vars is gitignored for a reason
2. **Verify signatures**: Discord request verification is critical
3. **Input validation**: Always validate interaction data
4. **Error handling**: Don't expose sensitive information in errors

### Cloudflare Workers Constraints
1. **No Node.js APIs**: server.js runs in Workers runtime (no fs, path, etc.)
2. **ES Modules only**: Must use import/export
3. **Limited execution time**: Requests timeout after limited time
4. **No persistent storage**: Use KV or Durable Objects if needed

### Discord API Guidelines
1. **Response time**: Must respond to interactions within 3 seconds
2. **Command names**: Lowercase, no spaces (use hyphens)
3. **Description length**: Max 100 characters
4. **Ephemeral messages**: Use flags for private responses

### Best Practices
1. **Keep it simple**: Cloudflare Workers are best for lightweight operations
2. **Error responses**: Always return appropriate HTTP status codes
3. **Case insensitive**: Command name matching uses `.toLowerCase()`
4. **Async operations**: Use async/await consistently
5. **Test coverage**: Maintain high test coverage for reliability

## Related Documentation

### Official Resources
- [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Reddit API](https://www.reddit.com/dev/api/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Tutorial
The official tutorial for building this bot: [Hosting on Cloudflare Workers](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers)

## Questions and Support

For issues or questions:
- GitHub Issues: https://github.com/discord/cloudflare-sample-app/issues
- Twitter: [@JustinBeckwith](https://twitter.com/JustinBeckwith)

---

**Last Updated**: 2025-11-21
**Compatible with**: awwbot v1.0.0
