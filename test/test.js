import { expect } from 'chai';
import { describe, it } from 'mocha';
import server from '../src/server.js';

describe('Server', () => {
  describe('GET /', () => {
    it('should return a greeting message with the Discord application ID', async () => {
      const request = {
        method: 'GET',
        url: new URL('/', 'http://discordo.example'),
      };
      const env = { DISCORD_APPLICATION_ID: '123456789' };

      const response = await server.fetch(request, env);
      const body = await response.text();

      expect(body).to.equal('👋 123456789');
    });
  });

  describe('All other routes', () => {
    it('should return a "Not Found" response', async () => {
      const request = {
        method: 'GET',
        url: new URL('/unknown', 'http://discordo.example'),
      };
      const response = await server.fetch(request, {});
      expect(response.status).to.equal(404);
      const body = await response.text();
      expect(body).to.equal('Not Found.');
    });
  });
});
