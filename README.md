# awwbot

> Bring the cuteness of r/aww straight to your discord server. Now on Cloudflare workers.

## How it works

When you create a Bot on Discord, you can receive common events from the client as [webhooks](https://discord.com/developers/docs/resources/webhook). Discord will call a pre-configured HTTPS endpoint, and send details on the event in the JSON payload.

This bot is an example of writing a webhook based bot which:

- Uses the [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
- Uses [Cloudflare Workers](https://workers.cloudflare.com/) for hosting
- Uses the [Reddit API](https://www.reddit.com/dev/api/) to send messages back to the user

## Creating bot on Discord

To start, we're going to create the application and bot on the Discord Developer Dashboard:

- Visit https://discord.com/developers/applications
- Click `New Application`, and choose a name
- Copy your Public Key and Application ID, and put them somewhere locally (we'll need these later)
- Click on the `Bot` tab, and create a bot! Choose the same name as your app.
- Grab the token for your bot, and keep it somewhere safe locally (I like to put these tokens in [1password](https://1password.com/))
- Click on the `OAuth2` tab, and choose the `URL Generator`. Click the `bot` and `applications.commands` scopes.
- Click on the `Send Messages` and `Use Slash Commands` Bot Permissions
- Copy the Generated Url, and paste it into the browser. Select the server where you'd like to develop your bot.

## Creating your Cloudflare worker

Cloudflare Workers are a convenient way to host Discord bots due to the free tier, simple development model, and automatically managed environment (no VMs!).

- Visit the [Cloudflare dashboard](https://dash.cloudflare.com/)
- Click on the `Workers` tab, and create a new service using the same name as your Discord bot
- Make sure to [install the Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-update/) and set it up.

### Storing secrets

The production service needs access to some of the information we saved earlier. To set those variables, run:

```
$ wrangler secret put DISCORD_TOKEN
$ wrangler secret put DISCORD_PUBLIC_KEY
$ wrangler secret put DISCORD_APPLICATION_ID
$ wrangler secret put DISCORD_TEST_GUILD_ID
```

## Running locally

> :bangbang: This depends on the beta version of the `wrangler` package, which better supports ESM on Cloudflare Workers.

We're finally ready to run this code locally!

```
$ npm install
$ npm run dev
$ npm run ngrok
```

```
$ DISCORD_TOKEN=**_ DISCORD_APPLICATION_ID=_** node src/register.js
```

## Questions?

Feel free to post an issue here, or reach out to [@justinbeckwith](https://twitter.com/JustinBeckwith)!
