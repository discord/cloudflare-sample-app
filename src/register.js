import { AWW_COMMAND, INVITE_COMMAND } from './commands.js';

// todo: this is really meant to be run locally.  romance eslint to allow
// process.env here and require it for the token.
const token = 'not-a-real-token';
const applicationId = 'not-a-real-applicationId';
const testGuildId = 'not-a-real-test-guild-id';

async function registerGuildCommands() {
  const url = `https://discord.com/api/v8/applications/${applicationId}/guilds/${testGuildId}/commands`;
  console.log(url);
  const res = await registerCommands(url);
  const json = await res.json();
  console.log(json);
  json.forEach(async (cmd) => {
    const response = await fetch(
      `https://discord.com/api/v8/applications/${applicationId}/guilds/${testGuildId}/commands/${cmd.id}`
    );
    if (!response.ok) {
      console.error(`Problem removing command ${cmd.id}`);
    }
  });
}

// eslint-disable-next-line no-unused-vars
async function registerGlobalCommands() {
  const url = `https://discord.com/api/v8/applications/${applicationId}/commands`;
  await registerCommands(url);
}

async function registerCommands(url) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify([AWW_COMMAND, INVITE_COMMAND]),
  });

  if (response.ok) {
    console.log('Registered all commands');
  } else {
    console.error('Error registering commands');
    const text = await response.text();
    console.error(text);
  }
  return response;
}

await registerGuildCommands();
