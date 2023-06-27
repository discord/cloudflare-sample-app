/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { PING_COMMAND, REVIVE_COMMAND, TEST_COMMAND } from './commands.js';
import { InteractionResponseFlags } from 'discord-interactions';

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
// eslint-disable-next-line no-unused-vars
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (interaction.data.name.toLowerCase()) {
      // Revive ping command - checks if a user has a role and pings a role if they do
      case REVIVE_COMMAND.name.toLowerCase(): {
        if (interaction.member.roles.includes('909724765026148402')) {
          console.log('handling revive request');
          return new JsonResponse({
            type: 4,
            data: {
              content:
                "Hey there <@&879527848573042738> squad, it's time to make the chat active!",
              allowed_mentions: {
                roles: ['879527848573042738'],
              },
            },
          });
        }
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              'You do not have the correct role necessary to perform this action. If you believe this is an error, please contact CyberFlame United#0001 (<@218977195375329281>).',
            flags: 64,
          },
        });
      }
      // Test command - for testing
      case TEST_COMMAND.name.toLowerCase(): {
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Test successful :)',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
      // Ping command - for checking latency of the bot, returned as a non-ephemeral message
      case PING_COMMAND.name.toLowerCase(): {
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Pong! Latency: ${
              Date.now() - Math.round(interaction.id / 4194304 + 1420070400000)
            }ms (rounded to nearest integer)`,
          },
        });
      }
      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest: verifyDiscordRequest,
  fetch: async function (request, env) {
    return router.handle(request, env);
  },
};

export default server;
