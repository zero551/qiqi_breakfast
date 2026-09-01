// 早餐条目。image / recipe 字段为 V2 预留，V1 不填。
export interface Breakfast {
  id: string;
  name: string;
  emoji: string;
  wantToEat: boolean; // 只有 true 才进入老虎机
  image?: string;     // V2: 图片地址
  recipe?: string;    // V2: 做法
  createdAt: number;
}

// 抽选历史记录
export interface DrawRecord {
  id: string;
  breakfastId: string;
  name: string;   // 冗余存名字，防止之后删除早餐导致历史丢失名称
  emoji: string;
  by: string;     // 抽的人（本地昵称）
  at: number;     // 时间戳
}
