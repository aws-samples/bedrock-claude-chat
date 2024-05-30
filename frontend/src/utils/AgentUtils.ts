const logisticCurve = (x: number) => {
  const L = 1; // 最大値
  const k = 0.8; // 勾配を決定する定数
  const x0 = 3; // 中点
  return L / (1 + Math.exp(-k * (x - x0)));
};

const MAX_BLOCK = 20;
export const progress = (thinkingCount: number) => {
  const percentage = logisticCurve(thinkingCount);
  const progressBlock = Math.floor(percentage * MAX_BLOCK);
  const current = [...Array(progressBlock)].map((_) => '◼︎');
  const rest = [...Array(MAX_BLOCK - progressBlock)].map((_) => '◻︎');

  return `${[...current, ...rest].join('')} ${Math.round(
    logisticCurve(thinkingCount) * 100
  )}%`;
};
