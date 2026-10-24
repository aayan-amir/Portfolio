import { useCallback, useEffect, useRef, useState } from 'react';
import { readLocal, writeLocal } from './storage';
type Cue = 'click' | 'arrival' | 'dock' | 'signal';
export function useCabinAudio(reading: boolean) {
  const [enabled, setEnabled] = useState(false),
    [volume, setVolumeState] = useState(0.35);
  const graph = useRef<{
    context: AudioContext;
    master: GainNode;
    hum: GainNode;
    osc: OscillatorNode;
  } | null>(null);
  const enabledRef = useRef(false);
  useEffect(() => {
    const stored = readLocal<unknown>('cabin-volume', 0.35);
    if (typeof stored === 'number' && Number.isFinite(stored))
      setVolumeState(Math.max(0, Math.min(1, stored)));
  }, []);
  const play = useCallback((cue: Cue) => {
    const g = graph.current;
    if (
      !g ||
      !enabledRef.current ||
      document.hidden ||
      g.context.state !== 'running'
    )
      return;
    const tones =
      cue === 'signal'
        ? [261.63, 329.63, 392, 329.63, 523.25]
        : cue === 'arrival'
          ? [196, 293.66, 392]
          : cue === 'dock'
            ? [220, 146.83]
            : [380];
    tones.forEach((frequency, i) => {
      const o = g.context.createOscillator(),
        gain = g.context.createGain(),
        start = g.context.currentTime + i * 0.14;
      o.type = 'sine';
      o.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
      o.connect(gain);
      gain.connect(g.master);
      o.start(start);
      o.stop(start + 0.26);
      o.onended = () => {
        o.disconnect();
        gain.disconnect();
      };
    });
  }, []);
  const toggle = useCallback(async () => {
    if (enabledRef.current) {
      enabledRef.current = false;
      setEnabled(false);
      writeLocal('cabin-sound', false);
      await graph.current?.context.suspend();
      return;
    }
    try {
      if (!graph.current) {
        const context = new AudioContext();
        const master = context.createGain(),
          hum = context.createGain(),
          filter = context.createBiquadFilter(),
          osc = context.createOscillator();
        master.gain.value = volume;
        hum.gain.value = 0.035;
        filter.type = 'lowpass';
        filter.frequency.value = 90;
        osc.type = 'triangle';
        osc.frequency.value = 48;
        osc.connect(filter);
        filter.connect(hum);
        hum.connect(master);
        master.connect(context.destination);
        osc.start();
        graph.current = { context, master, hum, osc };
      }
      await graph.current.context.resume();
      enabledRef.current = true;
      setEnabled(true);
      writeLocal('cabin-sound', true);
      play('click');
    } catch {
      enabledRef.current = false;
      setEnabled(false);
    }
  }, [volume, play]);
  function setVolume(value: number) {
    const v = Math.max(0, Math.min(1, value));
    setVolumeState(v);
    writeLocal('cabin-volume', v);
  }
  useEffect(() => {
    const g = graph.current;
    if (g) g.master.gain.setTargetAtTime(volume, g.context.currentTime, 0.06);
  }, [volume]);
  useEffect(() => {
    const g = graph.current;
    if (g)
      g.hum.gain.setTargetAtTime(
        reading ? 0.008 : 0.035,
        g.context.currentTime,
        0.15,
      );
  }, [reading, enabled]);
  useEffect(() => {
    const change = () => {
      const g = graph.current;
      if (!g) return;
      if (document.hidden) void g.context.suspend();
      else if (enabledRef.current)
        void g.context.resume().catch(() => {
          enabledRef.current = false;
          setEnabled(false);
        });
    };
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(
    () => () => {
      const g = graph.current;
      if (g) {
        g.osc.stop();
        void g.context.close();
        graph.current = null;
      }
    },
    [],
  );
  return { enabled, volume, setVolume, toggle, play };
}
