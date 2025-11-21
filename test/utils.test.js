import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import {
  withTimeout,
  createTimeoutError,
  isTimeoutError,
} from '../src/utils.js';

describe('Utils', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('withTimeout', () => {
    it('should resolve with the promise result when it completes in time', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 100);
      });

      const timeoutPromise = withTimeout(promise, 200, 'TestOperation');

      // Advance time to resolve the original promise
      clock.tick(100);

      const result = await timeoutPromise;
      expect(result).to.equal('success');
    });

    it('should reject with timeout error when promise takes too long', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 300);
      });

      const timeoutPromise = withTimeout(promise, 100, 'SlowOperation');

      // Advance time to trigger timeout
      clock.tick(100);

      try {
        await timeoutPromise;
        expect.fail('Should have thrown timeout error');
      } catch (error) {
        expect(error.message).to.include('SlowOperation');
        expect(error.message).to.include('timed out');
        expect(error.message).to.include('100ms');
      }
    });

    it('should use default operation name when not provided', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 300);
      });

      const timeoutPromise = withTimeout(promise, 100);

      clock.tick(100);

      try {
        await timeoutPromise;
        expect.fail('Should have thrown timeout error');
      } catch (error) {
        expect(error.message).to.include('Operation');
        expect(error.message).to.include('timed out');
      }
    });

    it('should propagate errors from the original promise', async () => {
      const promise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Original error')), 100);
      });

      const timeoutPromise = withTimeout(promise, 200, 'TestOperation');

      clock.tick(100);

      try {
        await timeoutPromise;
        expect.fail('Should have thrown original error');
      } catch (error) {
        expect(error.message).to.equal('Original error');
      }
    });

    it('should clear timeout when promise resolves', async () => {
      const clearTimeoutSpy = sinon.spy(global, 'clearTimeout');

      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 100);
      });

      const timeoutPromise = withTimeout(promise, 200, 'TestOperation');

      clock.tick(100);
      await timeoutPromise;

      expect(clearTimeoutSpy).to.have.been.called;
      clearTimeoutSpy.restore();
    });

    it('should clear timeout when promise rejects', async () => {
      const clearTimeoutSpy = sinon.spy(global, 'clearTimeout');

      const promise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Error')), 100);
      });

      const timeoutPromise = withTimeout(promise, 200, 'TestOperation');

      clock.tick(100);

      try {
        await timeoutPromise;
      } catch (error) {
        // Expected error
      }

      expect(clearTimeoutSpy).to.have.been.called;
      clearTimeoutSpy.restore();
    });

    it('should handle promises that resolve immediately', async () => {
      const promise = Promise.resolve('immediate');

      const result = await withTimeout(promise, 100, 'TestOperation');

      expect(result).to.equal('immediate');
    });

    it('should handle promises that reject immediately', async () => {
      const promise = Promise.reject(new Error('immediate error'));

      try {
        await withTimeout(promise, 100, 'TestOperation');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('immediate error');
      }
    });
  });

  describe('createTimeoutError', () => {
    it('should create an error with timeout properties', () => {
      const error = createTimeoutError('MyOperation', 5000);

      expect(error).to.be.instanceOf(Error);
      expect(error.name).to.equal('TimeoutError');
      expect(error.isTimeout).to.be.true;
      expect(error.message).to.include('MyOperation');
      expect(error.message).to.include('5000ms');
    });

    it('should include operation name and timeout in message', () => {
      const error = createTimeoutError('FetchData', 3000);

      expect(error.message).to.equal('FetchData timed out after 3000ms');
    });
  });

  describe('isTimeoutError', () => {
    it('should return true for errors created by createTimeoutError', () => {
      const error = createTimeoutError('Operation', 1000);

      expect(isTimeoutError(error)).to.be.true;
    });

    it('should return true for errors with TimeoutError name', () => {
      const error = new Error('Timeout');
      error.name = 'TimeoutError';

      expect(isTimeoutError(error)).to.be.true;
    });

    it('should return true for errors with isTimeout flag', () => {
      const error = new Error('Timeout');
      error.isTimeout = true;

      expect(isTimeoutError(error)).to.be.true;
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');

      expect(isTimeoutError(error)).to.be.false;
    });

    it('should return false for null', () => {
      expect(isTimeoutError(null)).to.be.false;
    });

    it('should return false for undefined', () => {
      expect(isTimeoutError(undefined)).to.be.false;
    });

    it('should return false for non-error objects', () => {
      expect(isTimeoutError({ message: 'Not an error' })).to.be.false;
      expect(isTimeoutError('string')).to.be.false;
      expect(isTimeoutError(123)).to.be.false;
    });
  });
});
