import { Snowflake } from "discord-api-types/globals";

export async function storeDiscordTokens(userId: Snowflake, tokens: Object, kv: KVNamespace) {
    await kv.put(`discord-${userId}`, JSON.stringify(tokens));
  }
  
  export async function getDiscordTokens(userId: Snowflake, kv: KVNamespace) {
    return kv.get(`discord-${userId}`, { type: "json" });
  }

  export type Tokens = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }
