import * as commands from './commands.js';
import dotenv from 'dotenv';
import process from 'node:process';

/**
 * This file is meant to be run from the command line, and is not used by the
 * application server.  It's allowed to use node.js primitives, and only needs
 * to be run once.
 */

dotenv.config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error('The DISCORD_TOKEN environment variable is required.');
}
if (!applicationId) {
  throw new Error(
    'The DISCORD_APPLICATION_ID environment variable is required.'
  );
}

/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */


async function register(url, body) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (response.ok) {
    console.log('Register success!');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error('Error during registration');
    let errorText = `Error registering: \n ${response.url}: ${response.status} ${response.statusText}`;
    try {
      const error = await response.text();
      if (error) {
        errorText = `${errorText} \n\n ${error}`;
      }
    } catch (err) {
      console.error('Error reading body from request:', err);
    }
    console.error(errorText);
  }
}

// supported types: number_lt=1, number_gt=2, number_eq=3 number_neq=4, datetime_lt=5, datetime_gt=6, boolean_eq=7, boolean_neq=8
const metadata = [
  {
    key: 'cookieseaten',
    name: 'Cookies Eaten',
    description: 'Cookies Eaten Greater Than',
    type: 2,
  },
  {
    key: 'allergictonuts',
    name: 'Allergic To Nuts',
    description: 'Is Allergic To Nuts',
    type: 7,
  },
  {
    key: 'bakingsince',
    name: 'Baking Since',
    description: 'Days since baking their first cookie',
    type: 6,
  },
];

const cmds = [
  commands.REVIVE_COMMAND,
  commands.TEST_COMMAND,
  commands.PING_COMMAND,
  commands.LOOKUP_COMMAND,
]

const commandEndpoint = `https://discord.com/api/v10/applications/${applicationId}/commands`;
const metadataEndpoint = `https://discord.com/api/v10/applications/${applicationId}/role-connections/metadata`;

register(commandEndpoint, cmds)
register(metadataEndpoint, metadata)

