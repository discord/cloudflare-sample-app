/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */
interface Command {
  name: string;
  description: string;
  options?: {
    type: number;
    name: string;
    description: string;
    required: boolean;
  }[];
}

export const REVIVE_COMMAND: Command = {
  name: 'revive',
  description:
    'Revival ping command, executable by members of the Promotions Team',
};

export const TEST_COMMAND: Command = {
  name: 'test',
  description: 'This command serves no purpose.',
};

export const PING_COMMAND: Command = {
  name: 'ping',
  description: 'Check latency stats of the bot.',
};

export const LOOKUP_COMMAND: Command = {
  name: 'lookup',
  description: 'Get detailed information on a standard!',
  options: [
    {
      type: 4,
      name: 'standard_number',
      description: 'Standard number to look up information for.',
      required: true,
    },
  ],
};
