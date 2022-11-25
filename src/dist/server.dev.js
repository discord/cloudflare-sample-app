"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ittyRouter = require("itty-router");

var _discordInteractions = require("discord-interactions");

var _commands = require("./commands.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var JsonResponse =
/*#__PURE__*/
function (_Response) {
  _inherits(JsonResponse, _Response);

  function JsonResponse(body, init) {
    _classCallCheck(this, JsonResponse);

    var jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      }
    };
    return _possibleConstructorReturn(this, _getPrototypeOf(JsonResponse).call(this, jsonBody, init));
  }

  return JsonResponse;
}(_wrapNativeSuper(Response));

var router = (0, _ittyRouter.Router)();
/**
 * A simple :wave: hello page to verify the worker is working.
 */

router.get('/', function (request, env) {
  return new Response("\uD83D\uDC4B ".concat(env.DISCORD_APPLICATION_ID));
});
/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
// eslint-disable-next-line no-unused-vars

router.post('/', function _callee(request, env) {
  var message;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(request.json());

        case 2:
          message = _context.sent;
          console.log(message);

          if (!(message.type === _discordInteractions.InteractionType.PING)) {
            _context.next = 7;
            break;
          }

          // The `PING` message is used during the initial webhook handshake, and is
          // required to configure the webhook in the developer portal.
          console.log('Handling Ping request');
          return _context.abrupt("return", new JsonResponse({
            type: _discordInteractions.InteractionResponseType.PONG
          }));

        case 7:
          if (!(message.type === _discordInteractions.InteractionType.APPLICATION_COMMAND)) {
            _context.next = 18;
            break;
          }

          _context.t0 = message.data.name.toLowerCase();
          _context.next = _context.t0 === _commands.REVIVE_COMMAND.name.toLowerCase() ? 11 : _context.t0 === _commands.TEST_COMMAND.name.toLowerCase() ? 15 : 16;
          break;

        case 11:
          if (!('909724765026148402' in message.member.roles)) {
            _context.next = 14;
            break;
          }

          console.log('handling revive request');
          return _context.abrupt("return", new JsonResponse({
            type: 4,
            data: {
              content: 'abcdef <@&984350646104915998>'
            }
          }));

        case 14:
          return _context.abrupt("return", new JsonResponse({
            type: 4,
            data: {
              content: 'You do not have the correct role necessary to perform this     action. If you believe this is an error, please contact CyberFlame United#0001 (<@218977195375329281>.',
              flags: 64
            }
          }));

        case 15:
          return _context.abrupt("return", new JsonResponse({
            type: 4,
            data: {
              content: 'Test successful :)',
              flags: 64
            }
          }));

        case 16:
          console.error('Unknown Command');
          return _context.abrupt("return", new JsonResponse({
            error: 'Unknown Type'
          }, {
            status: 400
          }));

        case 18:
          console.error('Unknown Type');
          return _context.abrupt("return", new JsonResponse({
            error: 'Unknown Type'
          }, {
            status: 400
          }));

        case 20:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.all('*', function () {
  return new Response('Not Found.', {
    status: 404
  });
});
var _default = {
  /**
   * Every request to a worker will start in the `fetch` method.
   * Verify the signature with the request, and dispatch to the router.
   * @param {*} request A Fetch Request object
   * @param {*} env A map of key/value pairs with env vars and secrets from the cloudflare env.
   * @returns
   */
  fetch: function fetch(request, env) {
    var signature, timestamp, body, isValidRequest;
    return regeneratorRuntime.async(function fetch$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(request.method === 'POST')) {
              _context2.next = 11;
              break;
            }

            // Using the incoming headers, verify this request actually came from discord.
            signature = request.headers.get('x-signature-ed25519');
            timestamp = request.headers.get('x-signature-timestamp');
            console.log(signature, timestamp, env.DISCORD_PUBLIC_KEY);
            _context2.next = 6;
            return regeneratorRuntime.awrap(request.clone().arrayBuffer());

          case 6:
            body = _context2.sent;
            isValidRequest = (0, _discordInteractions.verifyKey)(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

            if (isValidRequest) {
              _context2.next = 11;
              break;
            }

            console.error('Invalid Request');
            return _context2.abrupt("return", new Response('Bad request signature.', {
              status: 401
            }));

          case 11:
            return _context2.abrupt("return", router.handle(request, env));

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    });
  }
};
exports["default"] = _default;