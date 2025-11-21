/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from 'itty-router';
import { InteractionType, verifyKey } from 'discord-interactions';
import { AWW_COMMAND, INVITE_COMMAND, STATS_COMMAND, HEALTH_COMMAND } from './commands.js';
import { getCutePost } from './reddit.js';
import { ERROR_MESSAGES, DISCORD_CONFIG } from './config.js';
import {
  createPongResponse,
  createRedditPostResponse,
  createInviteResponse,
  createErrorResponse,
  createUnknownCommandResponse,
  createStatsResponse,
  createHealthResponse,
  createUnauthorizedResponse,
} from './responses.js';
import logger from './logger.js';
import { withTimeout, isTimeoutError } from './utils.js';
import {
  recordCommand,
  recordError,
  recordSubredditRequest,
  getStats,
  getCacheHitRate,
  formatUptime,
} from './stats.js';

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
 * Handles the health check endpoint.
 * @param {Request} request - The incoming HTTP request
 * @param {Object} env - Environment variables
 * @returns {Response} Health check response with application ID
 */
function handleHealthCheck(request, env) {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
}

/**
 * Handles PING interactions from Discord.
 * @returns {JsonResponse} PONG response
 */
function handlePingInteraction() {
  logger.logInteraction('PING', null, 'Received PING interaction');
  return new JsonResponse(createPongResponse());
}

/**
 * Checks if a user is authorized to use admin commands.
 * @param {Object} interaction - The Discord interaction object
 * @param {Object} env - Environment variables
 * @returns {boolean} True if user is authorized
 */
function isAuthorized(interaction, env) {
  const ownerId = DISCORD_CONFIG.getOwnerId(env);
  if (!ownerId) {
    return false; // Admin commands disabled if no owner ID set
  }
  return interaction?.member?.user?.id === ownerId || interaction?.user?.id === ownerId;
}

/**
 * Handles the /awwww command.
 * @param {Object} [interaction] - The Discord interaction object (optional)
 * @returns {Promise<JsonResponse>} Response with cute Reddit post or error
 */
async function handleAwwCommand(interaction) {
  const timer = logger.startTimer('awwww_command');
  recordCommand(AWW_COMMAND.name);

  try {
    // Extract subreddit option from interaction (if provided)
    const subreddit = interaction?.data?.options?.find(opt => opt.name === 'subreddit')?.value;

    logger.logInteraction('APPLICATION_COMMAND', AWW_COMMAND.name, 'Processing awwww command', {
      subreddit: subreddit ? `r/${subreddit}` : 'default (r/aww)'
    });

    // Record subreddit request for stats
    recordSubredditRequest(subreddit || 'aww');

    // Wrap getCutePost with timeout to ensure we respond within Discord's 3-second limit
    const post = await withTimeout(
      getCutePost(subreddit),
      DISCORD_CONFIG.OPERATION_TIMEOUT_MS,
      'getCutePost'
    );

    timer.end({ success: true, postTitle: post.title, subreddit });
    return new JsonResponse(createRedditPostResponse(post));
  } catch (error) {
    timer.end({ success: false, timeout: isTimeoutError(error) });
    recordError(isTimeoutError(error));

    // Check if it's a timeout error
    if (isTimeoutError(error)) {
      logger.warn('Command timed out', {
        command: AWW_COMMAND.name,
        timeoutMs: DISCORD_CONFIG.OPERATION_TIMEOUT_MS
      });
      return new JsonResponse(
        createErrorResponse(ERROR_MESSAGES.TIMEOUT_ERROR),
      );
    }

    // Regular error handling
    logger.error('Error handling awwww command', {
      error,
      command: AWW_COMMAND.name
    });
    return new JsonResponse(
      createErrorResponse(ERROR_MESSAGES.REDDIT_API_ERROR),
    );
  }
}

/**
 * Handles the /invite command.
 * @param {Object} env - Environment variables containing DISCORD_APPLICATION_ID
 * @returns {JsonResponse} Response with invite link
 */
function handleInviteCommand(env) {
  recordCommand(INVITE_COMMAND.name);
  logger.logInteraction('APPLICATION_COMMAND', INVITE_COMMAND.name, 'Processing invite command');
  const applicationId = env.DISCORD_APPLICATION_ID;
  return new JsonResponse(createInviteResponse(applicationId));
}

/**
 * Handles the /stats command (admin only).
 * @param {Object} interaction - The Discord interaction object
 * @param {Object} env - Environment variables
 * @returns {JsonResponse} Response with bot statistics or unauthorized error
 */
function handleStatsCommand(interaction, env) {
  recordCommand(STATS_COMMAND.name);
  logger.logInteraction('APPLICATION_COMMAND', STATS_COMMAND.name, 'Processing stats command');

  // Check authorization
  if (!isAuthorized(interaction, env)) {
    logger.warn('Unauthorized stats command attempt', {
      userId: interaction?.member?.user?.id || interaction?.user?.id
    });
    return new JsonResponse(createUnauthorizedResponse());
  }

  // Get statistics
  const stats = getStats();
  const cacheHitRate = getCacheHitRate();
  const formattedUptime = formatUptime(stats.uptime);

  return new JsonResponse(createStatsResponse(stats, formattedUptime, cacheHitRate));
}

/**
 * Handles the /health command (admin only).
 * @param {Object} interaction - The Discord interaction object
 * @param {Object} env - Environment variables
 * @returns {JsonResponse} Response with bot health status or unauthorized error
 */
function handleHealthCommand(interaction, env) {
  recordCommand(HEALTH_COMMAND.name);
  logger.logInteraction('APPLICATION_COMMAND', HEALTH_COMMAND.name, 'Processing health command');

  // Check authorization
  if (!isAuthorized(interaction, env)) {
    logger.warn('Unauthorized health command attempt', {
      userId: interaction?.member?.user?.id || interaction?.user?.id
    });
    return new JsonResponse(createUnauthorizedResponse());
  }

  // Get health information
  const stats = getStats();
  const formattedUptime = formatUptime(stats.uptime);

  return new JsonResponse(
    createHealthResponse(formattedUptime, stats.totalCommands, stats.errors)
  );
}

/**
 * Handles unknown commands.
 * @param {string} commandName - The name of the unknown command
 * @returns {JsonResponse} Error response for unknown command
 */
function handleUnknownCommand(commandName) {
  logger.warn('Unknown command received', {
    commandName,
    interactionType: 'APPLICATION_COMMAND'
  });
  return new JsonResponse(createUnknownCommandResponse(), {
    status: 400,
  });
}

/**
 * Handles unknown interaction types.
 * @param {number} interactionType - The unknown interaction type
 * @returns {JsonResponse} Error response for unknown interaction type
 */
function handleUnknownInteractionType(interactionType) {
  logger.error('Unknown interaction type received', {
    interactionType
  });
  return new JsonResponse(createUnknownCommandResponse(), { status: 400 });
}

/**
 * Routes APPLICATION_COMMAND interactions to appropriate handlers.
 * @param {Object} interaction - The Discord interaction object
 * @param {Object} env - Environment variables
 * @returns {Promise<JsonResponse>} Response from the appropriate command handler
 */
async function handleApplicationCommand(interaction, env) {
  const commandName = interaction.data.name.toLowerCase();

  switch (commandName) {
    case AWW_COMMAND.name.toLowerCase():
      return await handleAwwCommand(interaction);
    case INVITE_COMMAND.name.toLowerCase():
      return handleInviteCommand(env);
    case STATS_COMMAND.name.toLowerCase():
      return handleStatsCommand(interaction, env);
    case HEALTH_COMMAND.name.toLowerCase():
      return handleHealthCommand(interaction, env);
    default:
      return handleUnknownCommand(interaction.data.name);
  }
}

/**
 * Main handler for Discord interactions.
 * Routes interactions based on type (PING, APPLICATION_COMMAND, etc.).
 * @param {Request} request - The incoming HTTP request
 * @param {Object} env - Environment variables
 * @returns {Promise<Response>} Response to the Discord interaction
 */
async function handleDiscordInteraction(request, env) {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );

  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    return handlePingInteraction();
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    return await handleApplicationCommand(interaction, env);
  }

  return handleUnknownInteractionType(interaction.type);
}

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', handleHealthCheck);

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', handleDiscordInteraction);

/**
 * 404 handler for unknown routes.
 */
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
