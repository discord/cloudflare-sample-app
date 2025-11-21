/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

/**
 * Supported subreddits for cute content
 */
export const SUBREDDITS = {
  AWW: 'aww',
  EYEBLEACH: 'eyebleach',
  RAREPUPPERS: 'rarepuppers',
  CATS: 'cats',
  DOGS: 'dogpictures',
};

/**
 * Discord ApplicationCommandOptionType enum
 */
const CommandOptionType = {
  STRING: 3,
};

export const AWW_COMMAND = {
  name: 'awwww',
  description: 'Drop some cuteness on this channel.',
  options: [
    {
      type: CommandOptionType.STRING,
      name: 'subreddit',
      description: 'Choose which subreddit to get cute content from',
      required: false,
      choices: [
        {
          name: '🐱🐶 r/aww (default)',
          value: SUBREDDITS.AWW,
        },
        {
          name: '😍 r/eyebleach',
          value: SUBREDDITS.EYEBLEACH,
        },
        {
          name: '🐕 r/rarepuppers',
          value: SUBREDDITS.RAREPUPPERS,
        },
        {
          name: '🐱 r/cats',
          value: SUBREDDITS.CATS,
        },
        {
          name: '🐶 r/dogpictures',
          value: SUBREDDITS.DOGS,
        },
      ],
    },
  ],
};

export const INVITE_COMMAND = {
  name: 'invite',
  description: 'Get an invite link to add the bot to your server',
};
