import { Breakfast } from "./types";

// 预置的主流早餐，首次启动时灌入。
// 统一默认 wantToEat = true，进老虎机。
export const PRESET_BREAKFASTS: Omit<Breakfast, "id" | "createdAt">[] = [
  // 中式
  { name: "豆浆油条", emoji: "🥛", wantToEat: true },
  { name: "小笼包", emoji: "🥟", wantToEat: true },
  { name: "皮蛋瘦肉粥", emoji: "🥣", wantToEat: true },
  { name: "煎饼果子", emoji: "🫓", wantToEat: true },
  { name: "肠粉", emoji: "🍥", wantToEat: true },
  { name: "生煎包", emoji: "🥠", wantToEat: true },
  { name: "小馄饨", emoji: "🍲", wantToEat: true },
  { name: "鸡蛋灌饼", emoji: "🍳", wantToEat: true },
  { name: "手抓饼", emoji: "🌯", wantToEat: true },
  { name: "热干面", emoji: "🍜", wantToEat: true },
  { name: "烧麦", emoji: "🍘", wantToEat: true },
  { name: "肉包", emoji: "🥯", wantToEat: true },
  // 西式
  { name: "牛奶麦片", emoji: "🥣", wantToEat: true },
  { name: "三明治", emoji: "🥪", wantToEat: true },
  { name: "荷包蛋吐司", emoji: "🍞", wantToEat: true },
  { name: "培根煎蛋", emoji: "🥓", wantToEat: true },
  { name: "松饼", emoji: "🥞", wantToEat: true },
  { name: "牛角包", emoji: "🥐", wantToEat: true },
  { name: "酸奶水果碗", emoji: "🍓", wantToEat: true },
  { name: "华夫饼", emoji: "🧇", wantToEat: true },
];
