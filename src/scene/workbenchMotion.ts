export function mechanismPose(phase: number) {
  const t = Math.max(0, Math.min(1, phase));
  const ease = 1 - Math.pow(1 - t, 3);
  return {
    inputSlide: ease * 0.34,
    wingAngle: -ease * 0.25,
    traySlide: -ease * 0.42,
    leverAngle: -Math.sin(t * Math.PI) * 0.5,
  };
}
