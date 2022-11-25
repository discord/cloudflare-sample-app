"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TEST_COMMAND = exports.REVIVE_COMMAND = void 0;

/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */
var REVIVE_COMMAND = {
  name: 'revive',
  description: 'Revival ping command, executable by members of the Promotions Team'
};
exports.REVIVE_COMMAND = REVIVE_COMMAND;
var TEST_COMMAND = {
  name: 'test',
  description: 'This command serves no purpose.'
};
exports.TEST_COMMAND = TEST_COMMAND;