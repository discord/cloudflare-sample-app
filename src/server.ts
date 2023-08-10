/**
 * The core server that runs on a Cloudflare worker.
 */

import { Hono } from 'hono';
import {
  InteractionResponseType,
  InteractionResponseFlags,
  InteractionType,
} from 'discord-interactions';
import * as commands from './commands.js';
import { lookup } from './nzqa_lookup.js';
import * as discordJs from 'discord-api-types/v10';
import { isValidRequest } from 'discord-verify';

type Bindings = {
	DISCORD_PUBLIC_KEY: string
  DISCORD_APPLICATION_ID: string
	TOKEN: string
}

const router = new Hono<{ Bindings: Bindings }>();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (c) => {
  return new Response(`👋 ${c.env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
// eslint-disable-next-line no-unused-vars
router.post('/interactions', async (c) => {
  // const signature = c.req.header('x-signature-ed25519');
  // const timestamp = c.req.header('x-signature-timestamp');
  // const body = await c.req.text();
  // if (!verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY)) {
  //   console.error('Invalid Request');
  //   return c.text('Bad request signature.', 401);
  // }
  const isValid = await isValidRequest(c.req.raw, c.env.DISCORD_PUBLIC_KEY).catch(console.error)
  if (!isValid) return new Response('Invalid request', { status: 401 })
  const interaction = await c.req.json() as discordJs.APIInteraction;

  switch (interaction.type) {
    case discordJs.InteractionType.Ping: {
      // The `PING` message is used during the initial webhook handshake, and is
      // required to configure the webhook in the developer portal.
      return c.json({ type: InteractionResponseType.PONG });
    }

    case discordJs.InteractionType.ModalSubmit: {
      // The `MODAL_SUBMIT` message is sent when a user submits a modal form.
      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Thanks for submitting!',
        },
      });
    }

    case discordJs.InteractionType.ApplicationCommand: {
      // Most user commands will come as `APPLICATION_COMMAND`.
      switch (interaction.data.name.toLowerCase()) {
        // Revive ping command - checks if a user has a role and pings a role if they do
        case commands.REVIVE_COMMAND.name.toLowerCase(): {
          if (interaction.member && interaction.member.roles.includes('909724765026148402')) {
            console.log('handling revive request');
            return c.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content:
                  "Hey there <@&879527848573042738> squad, it's time to make the chat active!",
                allowed_mentions: {
                  roles: ['879527848573042738'],
                },
              },
            });
          }
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                'You do not have the correct role necessary to perform this action. If you believe this is an error, please contact CyberFlame United#0001 (<@218977195375329281>).',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        // Test command - for testing
        case commands.TEST_COMMAND.name.toLowerCase(): {
          return c.json({
            type: InteractionResponseType.MODAL,
            data: {
              custom_id: 'test',
              title: 'Test',
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      custom_id: 'name',
                      label: 'Name',
                      style: 1,
                      min_length: 1,
                      max_length: 4000,
                      placeholder: 'John',
                      required: true,
                    },
                  ],
                },
              ],
            },
          });
        }
case commands.LOOKUP_COMMAND.name.toLowerCase(): {
  if (interaction.data && 'options' in interaction.data && interaction.data.options) {
    const standardNumber = interaction.data.options[0] as discordJs.APIApplicationCommandInteractionDataNumberOption;
    c.executionCtx.waitUntil(
      lookup(
        standardNumber.value,
        interaction.application_id,
        interaction.token
      )
    );
    return c.json({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });
  } else {
    return c.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "I'm sorry, I don't recognize that command.",
      },
    });
  }
}

        // Ping command - for checking latency of the bot, returned as a non-ephemeral message
        case commands.PING_COMMAND.name.toLowerCase(): {
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Pong! Latency: ${
                Date.now() -
                Math.round(Number(interaction.id) / 4194304 + 1420070400000)
              }ms (rounded to nearest integer)`,
            },
          });
        }
        default:
          return c.json({ error: 'Unknown Type' }, { status: 400 });
      }
    }
  }

  console.error('Unknown Type');
  return c.json({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
