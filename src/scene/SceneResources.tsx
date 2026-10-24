import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { SceneResourcePool } from './sceneResourcePool';
const Resources = createContext<SceneResourcePool | null>(null);
export const useSceneResources = () => useContext(Resources);
export function SceneResources({ children }: { children: ReactNode }) {
  const [pool] = useState(() => new SceneResourcePool());
  useEffect(() => () => pool.dispose(), [pool]);
  return <Resources.Provider value={pool}>{children}</Resources.Provider>;
}
