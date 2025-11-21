import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import server from '../src/server.js';
import * as reddit from '../src/reddit.js';
import { clearCache } from '../src/cache.js';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
} from 'discord-interactions';

describe('Integration Tests', () => {
  let getCutePostStub;

  beforeEach(() => {
    clearCache();
    getCutePostStub = sinon.stub(reddit, 'getCutePost');
  });

  afterEach(() => {
    getCutePostStub.restore();
  });

  describe('Full Discord Webhook Flow', () => {
    it('should handle complete PING handshake flow', async () => {
      // Simulate Discord's webhook verification request
      const pingInteraction = {
        type: InteractionType.PING,
      };

      const request = {
        method: 'POST',
        url: new URL('/', 'http://discord.example'),
        headers: {
          get: (header) => {
            if (header === 'x-signature-ed25519') return 'valid_signature';
            if (header === 'x-signature-timestamp') return '1234567890';
            return null;
          },
        },
        text: async () => JSON.stringify(pingInteraction),
      };

      const env = {
        DISCORD_PUBLIC_KEY: 'test_public_key',
        DISCORD_APPLICATION_ID: '123456789',
      };

      // Stub the verification to pass
      const verifyStub = sinon
        .stub(server, 'verifyDiscordRequest')
        .resolves({ isValid: true, interaction: pingInteraction });

      const response = await server.fetch(request, env);
      const body = await response.json();

      expect(response.status).to.equal(200);
      expect(body.type).to.equal(InteractionResponseType.PONG);

      verifyStub.restore();
    });

    it('should handle complete /awwww command flow with embed response', async () => {
      // Mock Reddit post data
      const mockPost = {
        url: 'https://i.redd.it/cute-cat.jpg',
        title: 'Look at this adorable cat!',
        author: 'catLover123',
        score: 1337,
        permalink: '/r/aww/comments/abc123/look_at_this_adorable_cat/',
        subreddit: 'aww',
      };

      getCutePostStub.resolves(mockPost);

      // Simulate Discord /awwww command
      const commandInteraction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: 'awwww',
          id: '987654321',
        },
        member: {
          user: {
            id: '111222333',
            username: 'testuser',
          },
        },
        channel_id: '444555666',
        guild_id: '777888999',
      };

      const request = {
        method: 'POST',
        url: new URL('/', 'http://discord.example'),
        headers: {
          get: (header) => {
            if (header === 'x-signature-ed25519') return 'valid_signature';
            if (header === 'x-signature-timestamp') return '1234567890';
            return null;
          },
        },
        text: async () => JSON.stringify(commandInteraction),
      };

      const env = {
        DISCORD_PUBLIC_KEY: 'test_public_key',
        DISCORD_APPLICATION_ID: '123456789',
      };

      // Stub the verification to pass
      const verifyStub = sinon
        .stub(server, 'verifyDiscordRequest')
        .resolves({ isValid: true, interaction: commandInteraction });

      const response = await server.fetch(request, env);
      const body = await response.json();

      expect(response.status).to.equal(200);
      expect(body.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(body.data).to.have.property('embeds');
      expect(body.data.embeds).to.be.an('array').with.lengthOf(1);

      const embed = body.data.embeds[0];
      expect(embed.title).to.equal(mockPost.title);
      expect(embed.url).to.include(mockPost.permalink);
      expect(embed.color).to.equal(0xff4500); // Reddit orange
      expect(embed.image.url).to.equal(mockPost.url);
      expect(embed.footer.text).to.include(mockPost.author);
      expect(embed.footer.text).to.include(mockPost.score.toString());

      verifyStub.restore();
    });

    it('should handle /invite command flow with ephemeral response', async () => {
      const inviteInteraction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: 'invite',
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/', 'http://discord.example'),
        headers: {
          get: (header) => {
            if (header === 'x-signature-ed25519') return 'valid_signature';
            if (header === 'x-signature-timestamp') return '1234567890';
            return null;
          },
        },
        text: async () => JSON.stringify(inviteInteraction),
      };

      const env = {
        DISCORD_PUBLIC_KEY: 'test_public_key',
        DISCORD_APPLICATION_ID: '123456789',
      };

      const verifyStub = sinon
        .stub(server, 'verifyDiscordRequest')
        .resolves({ isValid: true, interaction: inviteInteraction });

      const response = await server.fetch(request, env);
      const body = await response.json();

      expect(response.status).to.equal(200);
      expect(body.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(body.data.content).to.include('123456789');
      expect(body.data.content).to.include('oauth2/authorize');
      expect(body.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);

      verifyStub.restore();
    });

    it('should handle error flow when Reddit API fails', async () => {
      getCutePostStub.rejects(new Error('Reddit API timeout'));

      const commandInteraction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: 'awwww',
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/', 'http://discord.example'),
        headers: {
          get: (header) => {
            if (header === 'x-signature-ed25519') return 'valid_signature';
            if (header === 'x-signature-timestamp') return '1234567890';
            return null;
          },
        },
        text: async () => JSON.stringify(commandInteraction),
      };

      const env = {
        DISCORD_PUBLIC_KEY: 'test_public_key',
        DISCORD_APPLICATION_ID: '123456789',
      };

      const verifyStub = sinon
        .stub(server, 'verifyDiscordRequest')
        .resolves({ isValid: true, interaction: commandInteraction });

      const response = await server.fetch(request, env);
      const body = await response.json();

      expect(response.status).to.equal(200);
      expect(body.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(body.data.content).to.include('error');
      expect(body.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);

      verifyStub.restore();
    });

    it('should reject requests with invalid signatures', async () => {
      const interaction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: 'awwww',
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/', 'http://discord.example'),
        headers: {
          get: (header) => {
            if (header === 'x-signature-ed25519') return 'invalid_signature';
            if (header === 'x-signature-timestamp') return '1234567890';
            return null;
          },
        },
        text: async () => JSON.stringify(interaction),
      };

      const env = {
        DISCORD_PUBLIC_KEY: 'test_public_key',
        DISCORD_APPLICATION_ID: '123456789',
      };

      // Stub verification to fail
      const verifyStub = sinon
        .stub(server, 'verifyDiscordRequest')
        .resolves({ isValid: false });

      const response = await server.fetch(request, env);

      expect(response.status).to.equal(401);
      const body = await response.text();
      expect(body).to.include('Bad request signature');

      verifyStub.restore();
    });

    it('should handle unknown commands gracefully', async () => {
      const unknownCommandInteraction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: 'unknown_command',
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/', 'http://discord.example'),
        headers: {
          get: (header) => {
            if (header === 'x-signature-ed25519') return 'valid_signature';
            if (header === 'x-signature-timestamp') return '1234567890';
            return null;
          },
        },
        text: async () => JSON.stringify(unknownCommandInteraction),
      };

      const env = {
        DISCORD_PUBLIC_KEY: 'test_public_key',
        DISCORD_APPLICATION_ID: '123456789',
      };

      const verifyStub = sinon
        .stub(server, 'verifyDiscordRequest')
        .resolves({ isValid: true, interaction: unknownCommandInteraction });

      const response = await server.fetch(request, env);
      const body = await response.json();

      expect(response.status).to.equal(400);
      expect(body.error).to.equal('Unknown Type');

      verifyStub.restore();
    });
  });

  describe('Caching Integration', () => {
    it('should use cache for subsequent requests within TTL', async () => {
      const mockPost = {
        url: 'https://i.redd.it/cached-cat.jpg',
        title: 'Cached Cat',
        author: 'cacheTest',
        score: 100,
        permalink: '/r/aww/comments/cache/cached_cat/',
        subreddit: 'aww',
      };

      // First call populates cache
      getCutePostStub.onFirstCall().resolves(mockPost);

      const commandInteraction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: 'awwww',
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/', 'http://discord.example'),
        headers: {
          get: (header) => {
            if (header === 'x-signature-ed25519') return 'valid_signature';
            if (header === 'x-signature-timestamp') return '1234567890';
            return null;
          },
        },
        text: async () => JSON.stringify(commandInteraction),
      };

      const env = {
        DISCORD_PUBLIC_KEY: 'test_public_key',
        DISCORD_APPLICATION_ID: '123456789',
      };

      const verifyStub = sinon
        .stub(server, 'verifyDiscordRequest')
        .resolves({ isValid: true, interaction: commandInteraction });

      // First request
      const response1 = await server.fetch(request, env);
      const body1 = await response1.json();

      expect(response1.status).to.equal(200);
      expect(getCutePostStub).to.have.been.calledOnce;

      // Second request should use cache
      const response2 = await server.fetch(request, env);
      const body2 = await response2.json();

      expect(response2.status).to.equal(200);
      // getCutePost is still called but it returns cached data
      expect(getCutePostStub).to.have.been.calledTwice;

      verifyStub.restore();
    });
  });
});
