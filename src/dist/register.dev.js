"use strict";

var _commands = require("./commands.js");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * This file is meant to be run from the command line, and is not used by the
 * application server.  It's allowed to use node.js primitives, and only needs
 * to be run once.
 */

/* eslint-disable no-undef */
var token = process.env.DISCORD_TOKEN;
var applicationId = process.env.DISCORD_APPLICATION_ID;
var testGuildId = process.env.DISCORD_TEST_GUILD_ID;

if (!token) {
  throw new Error('The DISCORD_TOKEN environment variable is required.');
}

if (!applicationId) {
  throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
}
/**
 * Register all commands with a specific guild/server. Useful during initial
 * development and testing.
 */
// eslint-disable-next-line no-unused-vars


function registerGuildCommands() {
  var url, res, json;
  return regeneratorRuntime.async(function registerGuildCommands$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (testGuildId) {
            _context2.next = 2;
            break;
          }

          throw new Error('The DISCORD_TEST_GUILD_ID environment variable is required.');

        case 2:
          url = "https://discord.com/api/v10/applications/".concat(applicationId, "/guilds/").concat(testGuildId, "/commands");
          _context2.next = 5;
          return regeneratorRuntime.awrap(registerCommands(url));

        case 5:
          res = _context2.sent;
          _context2.next = 8;
          return regeneratorRuntime.awrap(res.json());

        case 8:
          json = _context2.sent;
          console.log(json);
          json.forEach(function _callee(cmd) {
            var response;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap((0, _nodeFetch["default"])("https://discord.com/api/v10/applications/".concat(applicationId, "/guilds/").concat(testGuildId, "/commands/").concat(cmd.id)));

                  case 2:
                    response = _context.sent;

                    if (!response.ok) {
                      console.error("Problem removing command ".concat(cmd.id));
                    }

                  case 4:
                  case "end":
                    return _context.stop();
                }
              }
            });
          });

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
}
/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */
// eslint-disable-next-line no-unused-vars


function registerGlobalCommands() {
  var url;
  return regeneratorRuntime.async(function registerGlobalCommands$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          url = "https://discord.com/api/v10/applications/".concat(applicationId, "/commands");
          _context3.next = 3;
          return regeneratorRuntime.awrap(registerCommands(url));

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function registerCommands(url) {
  var response, text;
  return regeneratorRuntime.async(function registerCommands$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap((0, _nodeFetch["default"])(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: "Bot ".concat(token)
            },
            method: 'PUT',
            body: JSON.stringify([_commands.REVIVE_COMMAND, _commands.TEST_COMMAND])
          }));

        case 2:
          response = _context4.sent;

          if (!response.ok) {
            _context4.next = 7;
            break;
          }

          console.log('Registered all commands');
          _context4.next = 12;
          break;

        case 7:
          console.error('Error registering commands');
          _context4.next = 10;
          return regeneratorRuntime.awrap(response.text());

        case 10:
          text = _context4.sent;
          console.error(text);

        case 12:
          return _context4.abrupt("return", response);

        case 13:
        case "end":
          return _context4.stop();
      }
    }
  });
}

registerGlobalCommands(); // await registerGuildCommands();