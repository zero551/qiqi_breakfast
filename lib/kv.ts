// 服务端专用：Upstash Redis 连接。
// 仅当存在环境变量时认为处于云端模式。
import { Redis } from "@upstash/redis";

export function isCloud(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis({
      url: process.env.KV_REST_API_URL as string,
      token: process.env.KV_REST_API_TOKEN as string,
    });
  }
  return client;
}
