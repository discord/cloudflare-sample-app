/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { AWW_COMMAND, INVITE_COMMAND } from './commands.js';
import { getCuteUrl } from './reddit.js';
import { InteractionResponseFlags } from 'discord-interactions';

/**
 * Custom Response class for returning JSON data with proper headers.
 * @extends Response
 */
class JsonResponse extends Response {
  /**
   * Creates a new JSON response.
   * @param {Object} body - The object to be serialized as JSON
   * @param {ResponseInit} [init] - Optional response initialization options
   */
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
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
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
      case AWW_COMMAND.name.toLowerCase(): {
        try {
          const cuteUrl = await getCuteUrl();
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: cuteUrl,
            },
          });
        } catch (error) {
          console.error('Error handling awwww command:', error);
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                'Sorry, I encountered an error fetching cute content. Please try again later! 😿',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
      }
      case INVITE_COMMAND.name.toLowerCase(): {
        const applicationId = env.DISCORD_APPLICATION_ID;
        const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: INVITE_URL,
            flags: InteractionResponseFlags.EPHEMERAL,
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

/**
 * Verifies that a Discord request is authentic using Ed25519 signature verification.
 * @param {Request} request - The incoming HTTP request
 * @param {Object} env - Environment variables containing DISCORD_PUBLIC_KEY
 * @returns {Promise<{isValid: boolean, interaction?: Object}>} Validation result and parsed interaction
 */
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

/**
 * Server object exported as Cloudflare Worker handler.
 * Implements the required fetch method for handling incoming requests.
 */
const server = {
  verifyDiscordRequest: verifyDiscordRequest,
  /**
   * Main fetch handler for the Cloudflare Worker.
   * @param {Request} request - The incoming HTTP request
   * @param {Object} env - Environment variables (DISCORD_PUBLIC_KEY, DISCORD_APPLICATION_ID, etc.)
   * @returns {Promise<Response>} The HTTP response
   */
  fetch: async function (request, env) {
    return router.fetch(request, env);
  },
};

export default server;
