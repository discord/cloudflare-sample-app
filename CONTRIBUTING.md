# Contributing to awwbot

Thank you for your interest in contributing to awwbot! This document provides guidelines and instructions for contributing to this Discord bot project.

## Code of Conduct

Be respectful, constructive, and professional in all interactions. We're all here to learn and build together.

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: Comes with Node.js
- **Cloudflare Account**: For testing deployments (optional for local development)
- **Discord Application**: For testing bot interactions

### Setting Up Your Development Environment

1. **Fork and Clone**
   ```bash
   git fork https://github.com/discord/cloudflare-sample-app.git
   cd cloudflare-sample-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp example.dev.vars .dev.vars
   # Edit .dev.vars with your Discord credentials
   ```

4. **Register Commands**
   ```bash
   npm run register
   ```

5. **Start Local Development**
   ```bash
   # Terminal 1: Start Wrangler dev server
   npm run dev

   # Terminal 2: Start ngrok tunnel
   npm run ngrok
   ```

6. **Update Discord Webhook URL**
   - Copy the ngrok HTTPS URL
   - Paste it in Discord Developer Portal → Your App → Interactions Endpoint URL

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/` - New features (e.g., `feature/add-embed-support`)
- `fix/` - Bug fixes (e.g., `fix/reddit-api-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/cache-module`)
- `test/` - Test additions/updates (e.g., `test/add-cache-tests`)

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write Code**
   - Follow the code style guidelines below
   - Add JSDoc comments to all functions
   - Keep functions small and focused

3. **Write Tests**
   - All new features must include tests
   - Aim for >80% code coverage
   - Test edge cases and error scenarios

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Run Linter**
   ```bash
   npm run lint
   # Auto-fix issues
   npm run fix
   ```

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format**: `type(scope): description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or updates
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build process or tooling changes

**Examples**:
```
feat: add embed support for Discord responses
fix: handle Reddit API timeout errors gracefully
docs: update CONTRIBUTING.md with testing guidelines
test: add comprehensive tests for cache module
refactor: extract Reddit filtering logic
```

### Pull Request Process

1. **Update Documentation**
   - Update README.md if user-facing changes
   - Update CLAUDE.md if codebase structure changes
   - Update TODO.md to mark completed tasks

2. **Ensure CI Passes**
   - All tests must pass
   - Linting must pass
   - No security vulnerabilities

3. **Create Pull Request**
   - Use a descriptive title
   - Reference related issues
   - Describe what changed and why
   - Include testing steps

4. **PR Description Template**
   ```markdown
   ## Summary
   Brief description of changes

   ## Changes Made
   - Change 1
   - Change 2

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Manual testing completed
   - [ ] Edge cases considered

   ## Related Issues
   Closes #123
   ```

## Code Style Guidelines

### JavaScript Style

- **ES Modules**: Use `import`/`export` syntax
- **Async/Await**: Prefer over promises/callbacks
- **Arrow Functions**: Use for short functions
- **Destructuring**: Use for imports and objects
- **Single Quotes**: Enforced by Prettier
- **No Semicolons**: Enforced by Prettier

### ESLint Configuration

The project uses:
- `eslint:recommended`
- `prettier` (for formatting)
- `eslint-plugin-security` (for security checks)

### JSDoc Comments

All functions must have JSDoc comments:

```javascript
/**
 * Brief function description.
 * @param {Type} paramName - Parameter description
 * @returns {ReturnType} Return value description
 * @throws {Error} When error condition occurs
 */
function exampleFunction(paramName) {
  // Implementation
}
```

### File Organization

- **Keep files focused**: One responsibility per file
- **Export at module level**: No nested exports
- **Group imports**: Third-party, then local
- **Constants at top**: After imports

### Error Handling

- **Always handle errors**: Use try-catch blocks
- **Log errors**: Use `console.error()`
- **User-friendly messages**: Return helpful error messages
- **Validate inputs**: Check for null/undefined
- **Throw descriptive errors**: Include context

## Testing Guidelines

### Test Structure

Use Mocha's BDD style:

```javascript
describe('Feature', () => {
  let stub;

  beforeEach(() => {
    // Setup
    stub = sinon.stub(module, 'function');
  });

  afterEach(() => {
    // Cleanup
    stub.restore();
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await functionUnderTest(input);

    // Assert
    expect(result).to.equal('expected');
  });
});
```

### What to Test

- **Happy path**: Normal successful execution
- **Error cases**: API failures, network errors
- **Edge cases**: Empty inputs, null values
- **Async behavior**: Promises, callbacks
- **Mock external dependencies**: Reddit API, Discord API

### Test Coverage Goals

- **Minimum**: 80% code coverage
- **New code**: 100% coverage for new features
- **Critical paths**: Must be fully tested

## Cloudflare Workers Constraints

### Important Limitations

1. **No Node.js APIs**: Can't use `fs`, `path`, `process` in server.js
2. **ES Modules Only**: Must use `import`/`export`
3. **3-Second Timeout**: Discord requires responses within 3 seconds
4. **Stateless**: Use Cloudflare KV for persistence if needed
5. **Memory Limits**: Keep in-memory data minimal

### Best Practices

- Keep operations fast and lightweight
- Use caching to reduce API calls
- Handle errors gracefully
- Test locally with Wrangler

## Security Considerations

### Never Commit Secrets

- ✅ Use `.dev.vars` (gitignored)
- ❌ Never commit API keys, tokens, or passwords
- ❌ Don't log sensitive information

### Input Validation

- Validate all user inputs
- Sanitize data before use
- Check for malformed requests

### ESLint Security

The project uses `eslint-plugin-security` to catch:
- Regular expression DoS
- Unsafe regular expressions
- Potential command injection
- Insecure random number generation

## Adding New Commands

1. **Define Command** in `src/commands.js`:
   ```javascript
   export const NEW_COMMAND = {
     name: 'commandname',
     description: 'What this command does',
   };
   ```

2. **Add Handler** in `src/server.js`:
   ```javascript
   case NEW_COMMAND.name.toLowerCase(): {
     // Handle command
     return new JsonResponse({
       type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
       data: { content: 'Response' },
     });
   }
   ```

3. **Register Command** in `src/register.js`:
   ```javascript
   body: JSON.stringify([AWW_COMMAND, INVITE_COMMAND, NEW_COMMAND]),
   ```

4. **Add Tests** in `test/server.test.js`

5. **Run Registration**:
   ```bash
   npm run register
   ```

## Resources

### Documentation

- [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [itty-router Documentation](https://itty.dev/itty-router/)
- [Reddit API Documentation](https://www.reddit.com/dev/api/)

### Internal Documentation

- `CLAUDE.md` - AI assistant development guide
- `TODO.md` - Project tasks and roadmap
- `README.md` - User-facing documentation

## Getting Help

- **Questions**: Open a GitHub issue with the `question` label
- **Bugs**: Open a GitHub issue with the `bug` label
- **Feature Requests**: Open a GitHub issue with the `enhancement` label

## License

By contributing to awwbot, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to awwbot! 🐾
