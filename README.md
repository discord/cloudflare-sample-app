# Cloudflare worker example app

awwbot is an example app that brings the cuteness of `r/aww` straight to your Discord server, hosted on Cloudflare workers. Cloudflare Workers are a convenient way to host Discord bots due to the free tier, simple development model, and automatically managed environment (no VMs!).

The tutorial for building awwbot is [in the developer documentation](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers)

![awwbot in action](https://user-images.githubusercontent.com/534619/157503404-a6c79d1b-f0d0-40c2-93cb-164f9df7c138.gif)

## Resources used

- [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting
- [Reddit API](https://www.reddit.com/dev/api/) to send messages back to the user

---

## Project structure

Below is a basic overview of the project structure:

```
├── .github/workflows/ci.yaml -> Github Action configuration
├── src
│   ├── commands.js           -> JSON payloads for commands
│   ├── reddit.js             -> Interactions with the Reddit API
│   ├── register.js           -> Sets up commands with the Discord API
│   ├── server.js             -> Discord app logic and routing
├── test
|   ├── test.js               -> Tests for app
├── wrangler.toml             -> Configuration for Cloudflare workers
├── package.json
├── README.md
├── .eslintrc.json
├── .prettierignore
├── .prettierrc.json
└── .gitignore
```

## Configuring project

Before starting, you'll need a [Discord app](https://discord.com/developers/applications) with the following permissions:

- `bot` with the `Send Messages` and `Use Slash Command` permissions
- `applications.commands` scope

> ⚙️ Permissions can be configured by clicking on the `OAuth2` tab and using the `URL Generator`. After a URL is generated, you can install the app by pasting that URL into your browser and following the installation flow.

## Creating your Cloudflare worker

Next, you'll need to create a Cloudflare Worker.

- Visit the [Cloudflare dashboard](https://dash.cloudflare.com/)
- Click on the `Workers` tab, and create a new service using the same name as your Discord bot

## Running locally

First clone the project:

```
git clone https://github.com/discord/cloudflare-sample-app.git
```

Then navigate to its directory and install dependencies:

```
cd cloudflare-sample-app
npm install
```

> ⚙️ The dependencies in this project require at least v18 of [Node.js](https://nodejs.org/en/)

### Local configuration

> 💡 More information about generating and fetching credentials can be found [in the tutorial](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers#storing-secrets)

Rename `example.dev.vars` to `.dev.vars`, and make sure to set each variable.

**`.dev.vars` contains sensitive data so make sure it does not get checked into git**.

### Register commands

The following command only needs to be run once:

```
$ npm run register
```

### Run app

Now you should be ready to start your server:

```
$ npm run dev
```

### Setting up ngrok

When a user types a slash command, Discord will send an HTTP request to a given endpoint. During local development this can be a little challenging, so we're going to use a tool called `ngrok` to create an HTTP tunnel.

```
$ npm run ngrok
```

![forwarding](https://user-images.githubusercontent.com/534619/157511497-19c8cef7-c349-40ec-a9d3-4bc0147909b0.png)

This is going to bounce requests off of an external endpoint, and forward them to your machine. Copy the HTTPS link provided by the tool. It should look something like `https://8098-24-22-245-250.ngrok.io`. Now head back to the Discord Developer Dashboard, and update the "Interactions Endpoint URL" for your bot:

![interactions-endpoint](https://user-images.githubusercontent.com/534619/157510959-6cf0327a-052a-432c-855b-c662824f15ce.png)

This is the process we'll use for local testing and development. When you've published your bot to Cloudflare, you will _want to update this field to use your Cloudflare Worker URL._

## Deploying app

This repository is set up to automatically deploy to Cloudflare Workers when new changes land on the `main` branch. To deploy manually, run `npm run publish`, which uses the `wrangler publish` command under the hood. Publishing via a GitHub Action requires obtaining an [API Token and your Account ID from Cloudflare](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/authentication/#generate-tokens). These are stored [as secrets in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), making them available to GitHub Actions. The following configuration in `.github/workflows/ci.yaml` demonstrates how to tie it all together:

```yaml
release:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  needs: [test, lint]
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm install
    - run: npm run publish
      env:
        CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        CF_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
```

### Storing secrets

The credentials in `.dev.vars` are only applied locally. The production service needs access to credentials from your app:

```
$ wrangler secret put DISCORD_TOKEN
$ wrangler secret put DISCORD_PUBLIC_KEY
$ wrangler secret put DISCORD_APPLICATION_ID
```

## Troubleshooting

### Common Issues

#### Discord responds with "Application did not respond"

**Cause**: Discord requires responses within 3 seconds. If your worker takes longer, the interaction will timeout.

**Solutions**:
- Check Cloudflare Workers dashboard for error logs
- Verify your Interactions Endpoint URL is correct in Discord Developer Portal
- Ensure your worker is deployed and running
- Check that the Reddit API is responding quickly
- The bot uses caching to reduce Reddit API calls - first request may be slower

#### "Invalid signature" or "Bad request signature" errors

**Cause**: Discord request verification is failing.

**Solutions**:
- Verify `DISCORD_PUBLIC_KEY` is correctly set in `.dev.vars` (local) or as a secret (production)
- Ensure the public key matches your Discord application
- Check that you're not modifying the request body before verification
- Restart `wrangler dev` after changing `.dev.vars`

#### Commands not showing up in Discord

**Cause**: Commands haven't been registered with Discord API.

**Solutions**:
- Run `npm run register` to register slash commands
- Wait a few minutes for commands to propagate (can take up to 1 hour globally)
- Try `/awwww` in your server - sometimes commands don't appear in autocomplete immediately
- Verify `DISCORD_APPLICATION_ID` and `DISCORD_TOKEN` are correct in `.dev.vars`
- Check command registration succeeded (look for success message in console)

#### ngrok connection fails or times out

**Cause**: ngrok tunnel is not properly established or has expired.

**Solutions**:
- Free ngrok tunnels expire after 2 hours - restart with `npm run ngrok`
- Ensure ngrok is running in a separate terminal
- Copy the HTTPS URL (not HTTP) to Discord
- Update Discord Interactions Endpoint URL whenever ngrok restarts (URL changes)
- Consider upgrading to ngrok paid plan for static URLs

#### "No valid media posts found in r/aww" error

**Cause**: Reddit API returned no suitable posts after filtering.

**Solutions**:
- This is rare but can happen if Reddit is having issues
- The bot filters out NSFW, low-quality (< 10 upvotes), and gallery posts
- Try again - the error is usually temporary
- Check Reddit.com/r/aww to verify the subreddit is accessible

#### Embed not showing, just seeing a URL

**Cause**: Discord may not support the media format or the URL is invalid.

**Solutions**:
- The bot prioritizes reddit_video URLs and falls back to direct links
- Some external hosting sites may not work with Discord embeds
- Verify the post has a valid media URL in Reddit API response
- This is expected behavior for some post types

#### Tests failing with "fetch is not defined"

**Cause**: The test environment doesn't have global fetch.

**Solutions**:
- Tests stub the fetch function with Sinon
- Ensure `sinon.stub(global, 'fetch')` is in `beforeEach()`
- Make sure to restore stubs in `afterEach()` with `stub.restore()`
- Check that you're importing the function being tested correctly

#### ESLint errors about security

**Cause**: The security plugin flags potential security issues.

**Solutions**:
- Review the security warning carefully - it may be a false positive
- If legitimate, refactor the code to address the security concern
- For false positives, add `// eslint-disable-next-line security/rule-name` with justification
- Never disable security rules without understanding the implications

### Local Development Issues

#### Port 8787 already in use

**Solution**: Kill the existing process:
```bash
# On Linux/Mac
lsof -ti:8787 | xargs kill -9

# Or use a different port in wrangler.toml
```

#### Changes not reflecting in dev server

**Solutions**:
- Restart `wrangler dev`
- Clear browser cache
- Check for syntax errors in console
- Ensure file was saved

#### "Module not found" errors

**Solutions**:
- Run `npm install` to install dependencies
- Check import paths use `.js` extension (required for ES modules)
- Verify the file exists at the specified path

### Production Deployment Issues

#### Worker deployed but commands don't work

**Solutions**:
- Verify secrets are set in Cloudflare dashboard:
  ```bash
  wrangler secret put DISCORD_TOKEN
  wrangler secret put DISCORD_PUBLIC_KEY
  wrangler secret put DISCORD_APPLICATION_ID
  ```
- Update Discord Interactions Endpoint URL to your Worker URL (not ngrok)
- Check Cloudflare Workers logs for errors
- Ensure worker route is configured correctly

#### CI/CD pipeline failing

**Solutions**:
- Verify `CF_API_TOKEN` and `CF_ACCOUNT_ID` are set as GitHub secrets
- Check that tests pass locally (`npm test`)
- Ensure linting passes (`npm run lint`)
- Review GitHub Actions logs for specific errors

### Getting Help

If you're still having issues:

1. **Check the logs**:
   - Local: Terminal running `wrangler dev`
   - Production: Cloudflare Workers dashboard → Your Worker → Logs

2. **Enable debug logging**:
   - Add `console.log()` statements to trace execution
   - Check browser DevTools Network tab for request/response details

3. **Review documentation**:
   - [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
   - [Cloudflare Workers](https://developers.cloudflare.com/workers/)
   - [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

4. **Ask for help**:
   - Open an issue on GitHub with error messages and steps to reproduce
   - Include relevant logs (remove sensitive data)
   - Mention what you've already tried

## Questions?

Feel free to post an issue here, or reach out to [@justinbeckwith](https://twitter.com/JustinBeckwith)!
