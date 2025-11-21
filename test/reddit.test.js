import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import { getCuteUrl } from '../src/reddit.js';
import { clearCache } from '../src/cache.js';

describe('Reddit', () => {
  describe('getCuteUrl()', () => {
    let fetchStub;

    beforeEach(() => {
      // Clear cache before each test to ensure consistent behavior
      clearCache();
      fetchStub = sinon.stub(global, 'fetch');
    });

    afterEach(() => {
      fetchStub.restore();
    });

    it('should return a random cute URL from r/aww', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  url: 'https://i.redd.it/cute1.jpg',
                },
              },
              {
                data: {
                  url: 'https://i.redd.it/cute2.jpg',
                },
              },
            ],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      const result = await getCuteUrl();

      expect(result).to.be.a('string');
      expect(result).to.match(/https:\/\/i\.redd\.it\/cute[12]\.jpg/);
      expect(fetchStub).to.have.been.calledOnce;
      expect(fetchStub).to.have.been.calledWith(
        'https://www.reddit.com/r/aww/hot.json',
        sinon.match.has('headers'),
      );
    });

    it('should prioritize reddit_video fallback_url', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  url: 'https://i.redd.it/image.jpg',
                  media: {
                    reddit_video: {
                      fallback_url: 'https://v.redd.it/video1.mp4',
                    },
                  },
                },
              },
            ],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      const result = await getCuteUrl();

      expect(result).to.equal('https://v.redd.it/video1.mp4');
    });

    it('should use secure_media reddit_video as fallback', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  url: 'https://i.redd.it/image.jpg',
                  secure_media: {
                    reddit_video: {
                      fallback_url: 'https://v.redd.it/secure_video.mp4',
                    },
                  },
                },
              },
            ],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      const result = await getCuteUrl();

      expect(result).to.equal('https://v.redd.it/secure_video.mp4');
    });

    it('should filter out gallery posts', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                is_gallery: true,
                data: {
                  url: 'https://i.redd.it/gallery.jpg',
                },
              },
              {
                data: {
                  url: 'https://i.redd.it/cute.jpg',
                },
              },
            ],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      const result = await getCuteUrl();

      expect(result).to.equal('https://i.redd.it/cute.jpg');
    });

    it('should throw error when Reddit API returns non-OK status', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      };

      fetchStub.resolves(mockResponse);

      try {
        await getCuteUrl();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('503');
        expect(error.message).to.include('Service Unavailable');
      }
    });

    it('should throw error when no posts are found', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      try {
        await getCuteUrl();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('No posts found');
      }
    });

    it('should throw error when data structure is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {},
        }),
      };

      fetchStub.resolves(mockResponse);

      try {
        await getCuteUrl();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('No posts found');
      }
    });

    it('should throw error when no valid media posts are found', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                is_gallery: true,
                data: {
                  url: 'https://i.redd.it/gallery1.jpg',
                },
              },
              {
                is_gallery: true,
                data: {
                  url: 'https://i.redd.it/gallery2.jpg',
                },
              },
            ],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      try {
        await getCuteUrl();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('No valid media posts found');
      }
    });

    it('should throw error when fetch fails', async () => {
      fetchStub.rejects(new Error('Network error'));

      try {
        await getCuteUrl();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Network error');
      }
    });

    it('should use correct User-Agent header', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  url: 'https://i.redd.it/cute.jpg',
                },
              },
            ],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      await getCuteUrl();

      const fetchArgs = fetchStub.getCall(0).args;
      expect(fetchArgs[1].headers['User-Agent']).to.equal(
        'justinbeckwith:awwbot:v1.0.0 (by /u/justinblat)',
      );
    });

    it('should use cache on subsequent calls', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            children: [
              {
                data: {
                  url: 'https://i.redd.it/cute1.jpg',
                },
              },
              {
                data: {
                  url: 'https://i.redd.it/cute2.jpg',
                },
              },
            ],
          },
        }),
      };

      fetchStub.resolves(mockResponse);

      // First call should fetch from API
      const result1 = await getCuteUrl();
      expect(result1).to.be.a('string');
      expect(fetchStub).to.have.been.calledOnce;

      // Second call should use cache (no additional fetch)
      const result2 = await getCuteUrl();
      expect(result2).to.be.a('string');
      expect(fetchStub).to.have.been.calledOnce; // Still only one call
    });
  });
});
