export const logisticCurve = (x: number) => {
  const L = 1; // 最大値
  const k = 0.8; // 勾配を決定する定数
  const x0 = 3; // 中点
  return L / (1 + Math.exp(-k * (x - x0)));
};
