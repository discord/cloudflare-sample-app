/**
 * Response builder utilities for Discord interactions.
 * Provides helper functions to create consistent Discord API responses.
 */

import {
  InteractionResponseType,
  InteractionResponseFlags,
} from 'discord-interactions';
import { DISCORD_CONFIG } from './config.js';

/**
 * Creates a PONG response for Discord PING interactions.
 * Used during webhook handshake verification.
 * @returns {Object} Discord PONG response object
 */
export function createPongResponse() {
  return {
    type: InteractionResponseType.PONG,
  };
}

/**
 * Creates a standard message response.
 * @param {string} content - The message content to send
 * @param {boolean} [ephemeral=false] - Whether the message should be ephemeral (visible only to user)
 * @returns {Object} Discord message response object
 */
export function createMessageResponse(content, ephemeral = false) {
  const response = {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
    },
  };

  if (ephemeral) {
    response.data.flags = InteractionResponseFlags.EPHEMERAL;
  }

  return response;
}

/**
 * Creates an error message response (always ephemeral).
 * @param {string} errorMessage - The error message to display
 * @returns {Object} Discord error message response object
 */
export function createErrorResponse(errorMessage) {
  return createMessageResponse(errorMessage, true);
}

/**
 * Creates a rich embed response.
 * @param {Object} embed - The embed object with title, description, etc.
 * @param {boolean} [ephemeral=false] - Whether the message should be ephemeral
 * @returns {Object} Discord embed response object
 */
export function createEmbedResponse(embed, ephemeral = false) {
  const response = {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      embeds: [embed],
    },
  };

  if (ephemeral) {
    response.data.flags = InteractionResponseFlags.EPHEMERAL;
  }

  return response;
}

/**
 * Creates a Reddit post embed with standard formatting.
 * @param {Object} post - Reddit post object with url, title, author, score, permalink, subreddit
 * @returns {Object} Discord embed object configured for Reddit posts
 */
export function createRedditEmbed(post) {
  return {
    title: post.title,
    url: post.permalink,
    color: DISCORD_CONFIG.EMBED_COLOR,
    image: {
      url: post.url,
    },
    footer: {
      text: `👍 ${post.score} upvotes • Posted by u/${post.author} in r/${post.subreddit}`,
    },
  };
}

/**
 * Creates a complete Reddit post response with embed.
 * @param {Object} post - Reddit post object
 * @returns {Object} Discord embed response for Reddit post
 */
export function createRedditPostResponse(post) {
  const embed = createRedditEmbed(post);
  return createEmbedResponse(embed);
}

/**
 * Creates an invite link response.
 * @param {string} applicationId - Discord application ID
 * @returns {Object} Discord message response with invite link
 */
export function createInviteResponse(applicationId) {
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
  return createMessageResponse(inviteUrl, true);
}

/**
 * Creates an unknown command error response.
 * @returns {Object} Error response for unknown commands
 */
export function createUnknownCommandResponse() {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'Unknown command',
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  };
}

/**
 * Creates a statistics response embed.
 * @param {Object} stats - Statistics object
 * @param {string} formattedUptime - Formatted uptime string
 * @param {number} cacheHitRate - Cache hit rate percentage
 * @returns {Object} Discord embed response for statistics
 */
export function createStatsResponse(stats, formattedUptime, cacheHitRate) {
  const commandsList =
    Object.entries(stats.commandCounts)
      .map(([cmd, count]) => `• ${cmd}: ${count}`)
      .join('\n') || '• No commands executed yet';

  const subredditsList =
    Object.entries(stats.subredditRequests)
      .sort(([, a], [, b]) => b - a)
      .map(([sub, count]) => `• r/${sub}: ${count}`)
      .join('\n') || '• No subreddit requests yet';

  const embed = {
    title: '📊 Bot Statistics',
    color: DISCORD_CONFIG.EMBED_COLOR,
    fields: [
      {
        name: '⏱️ Uptime',
        value: formattedUptime,
        inline: true,
      },
      {
        name: '🎯 Total Commands',
        value: stats.totalCommands.toString(),
        inline: true,
      },
      {
        name: '💾 Cache Hit Rate',
        value: `${cacheHitRate}%`,
        inline: true,
      },
      {
        name: '📝 Commands',
        value: commandsList,
        inline: false,
      },
      {
        name: '🎨 Subreddits',
        value: subredditsList,
        inline: false,
      },
      {
        name: '❌ Errors',
        value: `${stats.errors} total (${stats.timeouts} timeouts)`,
        inline: true,
      },
      {
        name: '📦 Cache Stats',
        value: `${stats.cacheHits} hits, ${stats.cacheMisses} misses`,
        inline: true,
      },
    ],
    footer: {
      text: 'Statistics for this Worker instance',
    },
    timestamp: new Date().toISOString(),
  };

  return createEmbedResponse(embed, true);
}

/**
 * Creates a health check response embed.
 * @param {string} formattedUptime - Formatted uptime string
 * @param {number} totalRequests - Total number of requests
 * @param {number} errorCount - Number of errors
 * @returns {Object} Discord embed response for health check
 */
export function createHealthResponse(formattedUptime, totalRequests, errorCount) {
  const errorRate = totalRequests > 0
    ? ((errorCount / totalRequests) * 100).toFixed(2)
    : '0.00';

  const healthStatus = errorRate < 5 ? '✅ Healthy' : errorRate < 20 ? '⚠️ Degraded' : '❌ Unhealthy';

  const embed = {
    title: '🏥 Bot Health Status',
    color: errorRate < 5 ? 0x00ff00 : errorRate < 20 ? 0xffaa00 : 0xff0000,
    fields: [
      {
        name: 'Status',
        value: healthStatus,
        inline: true,
      },
      {
        name: 'Uptime',
        value: formattedUptime,
        inline: true,
      },
      {
        name: 'Error Rate',
        value: `${errorRate}%`,
        inline: true,
      },
      {
        name: 'Total Requests',
        value: totalRequests.toString(),
        inline: true,
      },
      {
        name: 'Total Errors',
        value: errorCount.toString(),
        inline: true,
      },
      {
        name: 'Platform',
        value: 'Cloudflare Workers',
        inline: true,
      },
    ],
    footer: {
      text: 'Health check for this Worker instance',
    },
    timestamp: new Date().toISOString(),
  };

  return createEmbedResponse(embed, true);
}

/**
 * Creates an unauthorized access response.
 * @returns {Object} Error response for unauthorized access
 */
export function createUnauthorizedResponse() {
  return createErrorResponse('⛔ This command is restricted to bot administrators only.');
}
