/* Adopting the logistic curve for the following reasons:
 * - It allows for representing progress without a defined maximum number of events.
 * - It is understood that the task typically concludes after approximately five events.
 * - The curve's initial slow progression that accelerates mid-way enhances the user experience (UX).
 */
export const logisticCurve = (x: number) => {
  const L = 1; // The maximum value
  const k = 0.8; // The constant that determines the steepness of the curve
  const x0 = 3; // The midpoint
  return L / (1 + Math.exp(-k * (x - x0)));
};
