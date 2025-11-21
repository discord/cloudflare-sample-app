import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import logger, {
  debug,
  info,
  warn,
  error,
  logInteraction,
  logPerformance,
  startTimer,
  setLogLevel,
  LogLevel,
} from '../src/logger.js';

describe('Logger', () => {
  let consoleLogStub;
  let consoleWarnStub;
  let consoleErrorStub;

  beforeEach(() => {
    consoleLogStub = sinon.stub(console, 'log');
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleErrorStub = sinon.stub(console, 'error');
    // Reset to INFO level before each test
    setLogLevel(LogLevel.INFO);
  });

  afterEach(() => {
    consoleLogStub.restore();
    consoleWarnStub.restore();
    consoleErrorStub.restore();
  });

  describe('Log Levels', () => {
    it('should log INFO messages by default', () => {
      info('Test info message');

      expect(consoleLogStub).to.have.been.calledOnce;
      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('INFO');
      expect(logMessage).to.include('Test info message');
    });

    it('should log WARN messages', () => {
      warn('Test warning message');

      expect(consoleWarnStub).to.have.been.calledOnce;
      const logMessage = consoleWarnStub.firstCall.args[0];
      expect(logMessage).to.include('WARN');
      expect(logMessage).to.include('Test warning message');
    });

    it('should log ERROR messages', () => {
      error('Test error message');

      expect(consoleErrorStub).to.have.been.calledOnce;
      const logMessage = consoleErrorStub.firstCall.args[0];
      expect(logMessage).to.include('ERROR');
      expect(logMessage).to.include('Test error message');
    });

    it('should not log DEBUG messages by default', () => {
      debug('Test debug message');

      expect(consoleLogStub).to.not.have.been.called;
    });

    it('should log DEBUG messages when log level is set to DEBUG', () => {
      setLogLevel(LogLevel.DEBUG);
      debug('Test debug message');

      expect(consoleLogStub).to.have.been.calledOnce;
      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('DEBUG');
      expect(logMessage).to.include('Test debug message');
    });

    it('should not log INFO when log level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      info('Test info message');

      expect(consoleLogStub).to.not.have.been.called;
    });

    it('should log WARN when log level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      warn('Test warning message');

      expect(consoleWarnStub).to.have.been.calledOnce;
    });

    it('should only log ERROR when log level is ERROR', () => {
      setLogLevel(LogLevel.ERROR);
      info('Info message');
      warn('Warn message');
      error('Error message');

      expect(consoleLogStub).to.not.have.been.called;
      expect(consoleWarnStub).to.not.have.been.called;
      expect(consoleErrorStub).to.have.been.calledOnce;
    });
  });

  describe('Message Formatting', () => {
    it('should include timestamp in log messages', () => {
      info('Test message');

      const logMessage = consoleLogStub.firstCall.args[0];
      // Check for ISO timestamp format
      expect(logMessage).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should include context data in log messages', () => {
      info('Test message', { userId: '123', action: 'test' });

      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('userId');
      expect(logMessage).to.include('123');
      expect(logMessage).to.include('action');
      expect(logMessage).to.include('test');
    });

    it('should handle empty context gracefully', () => {
      info('Test message', {});

      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('INFO');
      expect(logMessage).to.include('Test message');
      expect(logMessage).to.not.include('|');
    });

    it('should handle Error objects in context', () => {
      const testError = new Error('Test error');
      error('Error occurred', { error: testError });

      const logMessage = consoleErrorStub.firstCall.args[0];
      expect(logMessage).to.include('errorName');
      expect(logMessage).to.include('Error');
      expect(logMessage).to.include('errorMessage');
      expect(logMessage).to.include('Test error');
      expect(logMessage).to.include('errorStack');
    });
  });

  describe('Specialized Logging Functions', () => {
    it('should log interaction information with logInteraction', () => {
      logInteraction('APPLICATION_COMMAND', 'awwww', 'Command executed');

      expect(consoleLogStub).to.have.been.calledOnce;
      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('INFO');
      expect(logMessage).to.include('Command executed');
      expect(logMessage).to.include('interactionType');
      expect(logMessage).to.include('APPLICATION_COMMAND');
      expect(logMessage).to.include('commandName');
      expect(logMessage).to.include('awwww');
    });

    it('should handle null command name in logInteraction', () => {
      logInteraction('PING', null, 'Ping received');

      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('commandName');
      expect(logMessage).to.include('N/A');
    });

    it('should log performance metrics with logPerformance', () => {
      logPerformance('reddit_fetch', 245);

      expect(consoleLogStub).to.have.been.calledOnce;
      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('Performance metric');
      expect(logMessage).to.include('operation');
      expect(logMessage).to.include('reddit_fetch');
      expect(logMessage).to.include('durationMs');
      expect(logMessage).to.include('245');
    });

    it('should include additional context in logPerformance', () => {
      logPerformance('reddit_fetch', 245, { cacheHit: true });

      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('cacheHit');
      expect(logMessage).to.include('true');
    });
  });

  describe('Timer Functionality', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should measure operation duration with startTimer', () => {
      const timer = startTimer('test_operation');
      clock.tick(100); // Advance time by 100ms
      timer.end();

      expect(consoleLogStub).to.have.been.calledOnce;
      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('Performance metric');
      expect(logMessage).to.include('test_operation');
      expect(logMessage).to.include('100');
    });

    it('should include context when ending timer', () => {
      const timer = startTimer('test_operation');
      clock.tick(50);
      timer.end({ success: true, itemCount: 5 });

      const logMessage = consoleLogStub.firstCall.args[0];
      expect(logMessage).to.include('success');
      expect(logMessage).to.include('true');
      expect(logMessage).to.include('itemCount');
      expect(logMessage).to.include('5');
    });

    it('should return duration when ending timer', () => {
      const timer = startTimer('test_operation');
      clock.tick(75);
      const duration = timer.end();

      expect(duration).to.equal(75);
    });
  });

  describe('Default Logger Export', () => {
    it('should export all methods on default logger object', () => {
      expect(logger.debug).to.be.a('function');
      expect(logger.info).to.be.a('function');
      expect(logger.warn).to.be.a('function');
      expect(logger.error).to.be.a('function');
      expect(logger.logInteraction).to.be.a('function');
      expect(logger.logPerformance).to.be.a('function');
      expect(logger.startTimer).to.be.a('function');
      expect(logger.setLogLevel).to.be.a('function');
      expect(logger.LogLevel).to.be.an('object');
    });

    it('should have correct LogLevel values', () => {
      expect(logger.LogLevel.DEBUG).to.equal('DEBUG');
      expect(logger.LogLevel.INFO).to.equal('INFO');
      expect(logger.LogLevel.WARN).to.equal('WARN');
      expect(logger.LogLevel.ERROR).to.equal('ERROR');
    });
  });
});
