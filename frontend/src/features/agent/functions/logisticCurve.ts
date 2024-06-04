/* Adopting the logistic curve for the following reasons:
 * The agent takes time to handle complex tasks, but it improves the user's waiting experience by displaying progress using a logistic curve based on the number of actions. This curve shows a slow initial change, a rapid change in the middle, and eventually stabilizes.
 */
export const logisticCurve = (x: number) => {
  const L = 1; // The maximum value
  const k = 0.8; // The constant that determines the steepness of the curve
  const x0 = 3; // The midpoint
  return L / (1 + Math.exp(-k * (x - x0)));
};
