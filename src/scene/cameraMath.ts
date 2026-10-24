export function dragAngles(yaw: number, pitch: number, dx: number, dy: number) {
  return {
    yaw: Math.max(-0.61, Math.min(0.61, yaw - dx * 0.0015)),
    pitch: Math.max(-0.35, Math.min(0.35, pitch - dy * 0.0012)),
  };
}
