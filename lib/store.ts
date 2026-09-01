// 双模式数据层：
//  - 配置了 Upstash Redis 环境变量 => 云端模式（全家共享一份数据）
//  - 未配置 => 本地模式（存浏览器 localStorage，单机可玩，部署后自动升级）
import { Breakfast, DrawRecord } from "./types";
import { PRESET_BREAKFASTS } from "./presets";

var BREAKFASTS_KEY = "qiqi:breakfasts";
var HISTORY_KEY = "qiqi:history";
var HISTORY_KEEP_DAYS = 7;

function uid(): string {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toLowerCase();
}

function buildPresetList(): Breakfast[] {
  var now = Date.now();
  return PRESET_BREAKFASTS.map(function (p, i) {
    return Object.assign({}, p, { id: "preset-" + i + "-" + now.toString(36), createdAt: now });
  });
}

// ---------- 本地模式 ----------
function localGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    var raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    return null;
  }
}
function localSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// ---------- 云端模式（经由 Next API 路由访问 Redis） ----------
async function cloudFetch<T>(path: string, init?: RequestInit): Promise<T> {
  var headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init && init.headers) {
    var extra = init.headers as Record<string, string>;
    for (var k in extra) headers[k] = extra[k];
  }
  var res = await fetch(path, Object.assign({}, init, { headers: headers }));
  if (!res.ok) throw new Error("cloud request failed: " + res.status);
  return res.json() as Promise<T>;
}

export interface Store {
  isCloud: boolean;
  getBreakfasts(): Promise<Breakfast[]>;
  addBreakfast(name: string, emoji: string): Promise<Breakfast[]>;
  deleteBreakfast(id: string): Promise<Breakfast[]>;
  toggleWant(id: string): Promise<Breakfast[]>;
  getHistory(): Promise<DrawRecord[]>;
  recordDraw(b: Breakfast, by: string): Promise<DrawRecord[]>;
}

var localStore: Store = {
  isCloud: false,

  getBreakfasts: async function () {
    var list = localGet<Breakfast[]>(BREAKFASTS_KEY);
    if (!list) {
      list = buildPresetList();
      localSet(BREAKFASTS_KEY, list);
    }
    return list;
  },

  addBreakfast: async function (name, emoji) {
    var list = (await this.getBreakfasts()).slice();
    list.push({ id: uid(), name: name, emoji: emoji, wantToEat: true, createdAt: Date.now() });
    localSet(BREAKFASTS_KEY, list);
    return list;
  },

  deleteBreakfast: async function (id) {
    var list = (await this.getBreakfasts()).filter(function (b) { return b.id !== id; });
    localSet(BREAKFASTS_KEY, list);
    return list;
  },

  toggleWant: async function (id) {
    var list = (await this.getBreakfasts()).map(function (b) {
      return b.id === id ? Object.assign({}, b, { wantToEat: !b.wantToEat }) : b;
    });
    localSet(BREAKFASTS_KEY, list);
    return list;
  },

  getHistory: async function () {
    var all = localGet<DrawRecord[]>(HISTORY_KEY) || [];
    var cutoff = Date.now() - HISTORY_KEEP_DAYS * 86400000;
    return all.filter(function (r) { return r.at >= cutoff; })
      .sort(function (a, b) { return b.at - a.at; });
  },

  recordDraw: async function (b, by) {
    var all = localGet<DrawRecord[]>(HISTORY_KEY) || [];
    // 同一天只保留最后一次：先删掉今天的旧记录，再写入新记录
    var now = new Date();
    var isToday = function (ts: number) {
      var d = new Date(ts);
      return d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
    };
    all = all.filter(function (r) { return !isToday(r.at); });
    all.push({ id: uid(), breakfastId: b.id, name: b.name, emoji: b.emoji, by: by, at: Date.now() });
    localSet(HISTORY_KEY, all);
    return this.getHistory();
  },
};

var cloudStore: Store = {
  isCloud: true,

  getBreakfasts: async function () {
    return cloudFetch<Breakfast[]>("/api/breakfasts");
  },
  addBreakfast: async function (name, emoji) {
    return cloudFetch<Breakfast[]>("/api/breakfasts", {
      method: "POST",
      body: JSON.stringify({ name: name, emoji: emoji }),
    });
  },
  deleteBreakfast: async function (id) {
    return cloudFetch<Breakfast[]>("/api/breakfasts?id=" + encodeURIComponent(id), {
      method: "DELETE",
    });
  },
  toggleWant: async function (id) {
    return cloudFetch<Breakfast[]>("/api/breakfasts", {
      method: "PATCH",
      body: JSON.stringify({ id: id }),
    });
  },

  getHistory: async function () {
    return cloudFetch<DrawRecord[]>("/api/history");
  },
  recordDraw: async function (b, by) {
    return cloudFetch<DrawRecord[]>("/api/history", {
      method: "POST",
      body: JSON.stringify({ breakfast: b, by: by }),
    });
  },
};

var cachedMode: boolean | null = null;

export async function getStore(): Promise<Store> {
  if (cachedMode !== null) return cachedMode ? cloudStore : localStore;
  try {
    var res = await fetch("/api/mode", { cache: "no-store" });
    var j = (await res.json()) as { cloud: boolean };
    cachedMode = !!j.cloud;
  } catch (e) {
    cachedMode = false;
  }
  return cachedMode ? cloudStore : localStore;
}

var NICK_KEY = "qiqi:nickname";
export function getNickname(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NICK_KEY) || "";
}
export function setNickname(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NICK_KEY, name);
}
