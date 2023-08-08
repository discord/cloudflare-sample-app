import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import {
  InteractionResponseType,
  InteractionType,
  InteractionResponseFlags,
} from 'discord-interactions';
import { REVIVE_COMMAND, TEST_COMMAND } from '../src/commands.js';
import sinon from 'sinon';
import server from '../src/server.js';

describe('Server', () => {
  describe('GET /', () => {
    it('should return a greeting message with the Discord application ID', async () => {
      const request = {
        method: 'GET',
        url: new URL('/', 'https://discord.worker.nceahelp.com'),
      };
      const env = { DISCORD_APPLICATION_ID: '1045608895307067453' };

      const response = await server.fetch(request, env);
      const body = await response.text();

      expect(body).to.equal('👋 1045608895307067453');
    });
  });

  describe('POST /interactions', () => {
    let verifyDiscordRequestStub;

    beforeEach(() => {
      verifyDiscordRequestStub = sinon.stub(server, 'verifyDiscordRequest');
    });

    afterEach(() => {
      verifyDiscordRequestStub.restore();
    });

    it('should handle a PING interaction', async () => {
      const interaction = {
        type: InteractionType.PING,
      };

      const request = {
        method: 'POST',
        url: new URL('/interactions', 'https://discord.worker.nceahelp.com'),
      };

      const env = {};

      verifyDiscordRequestStub.resolves({
        isValid: true,
        interaction: interaction,
      });

      const response = await server.fetch(request, env);
      const body = await response.json();
      expect(body.type).to.equal(InteractionResponseType.PONG);
    });

    it('should handle a revive command interaction', async () => {
      const interaction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: REVIVE_COMMAND.name,
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/interactions', 'https://discord.worker.nceahelp.com'),
      };

      const env = {};

      verifyDiscordRequestStub.resolves({
        isValid: true,
        interaction: interaction,
      });

      const response = await server.fetch(request, env);
      const body = await response.json();
      expect(body.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
      );
    });

    it('should handle a test command interaction', async () => {
      const interaction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: TEST_COMMAND.name,
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/interactions', 'https://discord.worker.nceahelp.com'),
      };

      const env = {
        DISCORD_APPLICATION_ID: '1045608895307067453',
      };

      verifyDiscordRequestStub.resolves({
        isValid: true,
        interaction: interaction,
      });

      const response = await server.fetch(request, env);
      const body = await response.json();
      expect(body.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
      );
      expect(body.data.content).to.include(
        'https://discord.com/oauth2/authorize?client_id=1045608895307067453&scope=applications.commands+bot&permissions=8'
      );
      expect(body.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);
    });

    it('should handle an unknown command interaction', async () => {
      const interaction = {
        type: InteractionType.APPLICATION_COMMAND,
        data: {
          name: 'unknown',
        },
      };

      const request = {
        method: 'POST',
        url: new URL('/interactions', 'https://discord.worker.nceahelp.com'),
      };

      verifyDiscordRequestStub.resolves({
        isValid: true,
        interaction: interaction,
      });

      const response = await server.fetch(request, {});
      const body = await response.json();
      expect(response.status).to.equal(400);
      expect(body.error).to.equal('Unknown Type');
    });
  });

  describe('All other routes', () => {
    it('should return a "Not Found" response', async () => {
      const request = {
        method: 'GET',
        url: new URL('/unknown', 'https://discord.worker.nceahelp.com'),
      };
      const response = await server.fetch(request, {});
      expect(response.status).to.equal(404);
      const body = await response.text();
      expect(body).to.equal('Not Found.');
    });
  });
});
