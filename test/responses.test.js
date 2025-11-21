import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  InteractionResponseType,
  InteractionResponseFlags,
} from 'discord-interactions';
import {
  createPongResponse,
  createMessageResponse,
  createErrorResponse,
  createEmbedResponse,
  createRedditEmbed,
  createRedditPostResponse,
  createInviteResponse,
  createUnknownCommandResponse,
} from '../src/responses.js';

describe('Response Builders', () => {
  describe('createPongResponse()', () => {
    it('should create a PONG response', () => {
      const response = createPongResponse();

      expect(response).to.be.an('object');
      expect(response.type).to.equal(InteractionResponseType.PONG);
    });
  });

  describe('createMessageResponse()', () => {
    it('should create a standard message response', () => {
      const content = 'Test message';
      const response = createMessageResponse(content);

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.content).to.equal(content);
      expect(response.data.flags).to.be.undefined;
    });

    it('should create an ephemeral message response', () => {
      const content = 'Ephemeral message';
      const response = createMessageResponse(content, true);

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.content).to.equal(content);
      expect(response.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);
    });
  });

  describe('createErrorResponse()', () => {
    it('should create an ephemeral error response', () => {
      const errorMessage = 'Something went wrong';
      const response = createErrorResponse(errorMessage);

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.content).to.equal(errorMessage);
      expect(response.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);
    });
  });

  describe('createEmbedResponse()', () => {
    it('should create an embed response', () => {
      const embed = {
        title: 'Test Embed',
        description: 'Test description',
        color: 0xff0000,
      };
      const response = createEmbedResponse(embed);

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.embeds).to.be.an('array').with.lengthOf(1);
      expect(response.data.embeds[0]).to.deep.equal(embed);
      expect(response.data.flags).to.be.undefined;
    });

    it('should create an ephemeral embed response', () => {
      const embed = {
        title: 'Secret Embed',
      };
      const response = createEmbedResponse(embed, true);

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.embeds).to.be.an('array');
      expect(response.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);
    });
  });

  describe('createRedditEmbed()', () => {
    it('should create a Reddit post embed with all metadata', () => {
      const post = {
        url: 'https://i.redd.it/test.jpg',
        title: 'Test Post',
        author: 'testuser',
        score: 1234,
        permalink: '/r/aww/comments/abc/test_post/',
        subreddit: 'aww',
      };

      const embed = createRedditEmbed(post);

      expect(embed.title).to.equal(post.title);
      expect(embed.url).to.equal(post.permalink);
      expect(embed.color).to.equal(0xff4500); // Reddit orange
      expect(embed.image.url).to.equal(post.url);
      expect(embed.footer.text).to.include(post.author);
      expect(embed.footer.text).to.include(post.score.toString());
      expect(embed.footer.text).to.include(post.subreddit);
    });

    it('should handle posts with low scores', () => {
      const post = {
        url: 'https://i.redd.it/test.jpg',
        title: 'Low Score Post',
        author: 'testuser',
        score: 5,
        permalink: '/r/aww/comments/def/low_score/',
        subreddit: 'aww',
      };

      const embed = createRedditEmbed(post);

      expect(embed.footer.text).to.include('5 upvotes');
    });
  });

  describe('createRedditPostResponse()', () => {
    it('should create a complete Reddit post response with embed', () => {
      const post = {
        url: 'https://i.redd.it/test.jpg',
        title: 'Cute Cat',
        author: 'catlover',
        score: 999,
        permalink: '/r/aww/comments/xyz/cute_cat/',
        subreddit: 'aww',
      };

      const response = createRedditPostResponse(post);

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.embeds).to.be.an('array').with.lengthOf(1);

      const embed = response.data.embeds[0];
      expect(embed.title).to.equal(post.title);
      expect(embed.url).to.equal(post.permalink);
      expect(embed.image.url).to.equal(post.url);
    });
  });

  describe('createInviteResponse()', () => {
    it('should create an invite link response', () => {
      const applicationId = '123456789';
      const response = createInviteResponse(applicationId);

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.content).to.include(applicationId);
      expect(response.data.content).to.include('oauth2/authorize');
      expect(response.data.content).to.include('applications.commands');
      expect(response.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);
    });
  });

  describe('createUnknownCommandResponse()', () => {
    it('should create an unknown command error response', () => {
      const response = createUnknownCommandResponse();

      expect(response.type).to.equal(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      );
      expect(response.data.content).to.include('Unknown command');
      expect(response.data.flags).to.equal(InteractionResponseFlags.EPHEMERAL);
    });
  });
});
