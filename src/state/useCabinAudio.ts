import { useCallback, useEffect, useRef, useState } from 'react';
import { readLocal, writeLocal } from './storage';
import { cues, musicEvent, type Cue } from './audioScore';
type Graph = {
  context: AudioContext;
  effects: GainNode;
  music: GainNode;
  voices: Set<AudioScheduledSourceNode>;
  musicVoices: Set<AudioScheduledSourceNode>;
  noise: AudioBuffer;
};
const bounded = (v: number) =>
  Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
export function useCabinAudio(reading: boolean) {
  const [enabled, setEnabled] = useState(false),
    [musicEnabled, setMusicEnabled] = useState(false),
    [volume, setVolumeState] = useState(0.35),
    [musicVolume, setMusicVolumeState] = useState(0.3),
    [error, setError] = useState('');
  const graph = useRef<Graph | null>(null),
    flags = useRef({
      effects: false,
      music: false,
      volume: 0.35,
      musicVolume: 0.3,
      reading: false,
    });
  flags.current = {
    effects: enabled,
    music: musicEnabled,
    volume,
    musicVolume,
    reading,
  };
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const fx = readLocal<unknown>('cabin-volume', 0.35),
      music = readLocal<unknown>('cabin-music-volume', 0.3);
    if (typeof fx === 'number') setVolumeState(bounded(fx));
    if (typeof music === 'number') setMusicVolumeState(bounded(music));
  }, []);
  const ensure = useCallback(async () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!graph.current) {
      const context = new AudioContext(),
        effects = context.createGain(),
        music = context.createGain(),
        filter = context.createBiquadFilter();
      effects.gain.value = 0;
      music.gain.value = 0;
      filter.type = 'lowpass';
      filter.frequency.value = 1400;
      music.connect(filter);
      filter.connect(context.destination);
      effects.connect(context.destination);
      const noise = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * 0.45),
          context.sampleRate,
        ),
        samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++)
        samples[i] = Math.random() * 2 - 1;
      graph.current = {
        context,
        effects,
        music,
        voices: new Set(),
        musicVoices: new Set(),
        noise,
      };
    }
    await graph.current.context.resume();
    setError('');
    return graph.current;
  }, []);
  const play = useCallback((cue: Cue) => {
    const g = graph.current;
    if (
      !g ||
      !flags.current.effects ||
      document.hidden ||
      g.context.state !== 'running'
    )
      return;
    const score = cues[cue];
    score.notes.forEach((frequency, i) => {
      const osc = g.context.createOscillator(),
        envelope = g.context.createGain(),
        start = g.context.currentTime + 0.008 + i * score.gap;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, start);
      osc.frequency.exponentialRampToValueAtTime(
        frequency * 0.97,
        start + score.duration,
      );
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(score.gain, start + 0.012);
      envelope.gain.exponentialRampToValueAtTime(
        0.0001,
        start + score.duration,
      );
      osc.connect(envelope);
      envelope.connect(g.effects);
      g.voices.add(osc);
      osc.onended = () => {
        g.voices.delete(osc);
        osc.disconnect();
        envelope.disconnect();
      };
      osc.start(start);
      osc.stop(start + score.duration + 0.02);
    });
    if (score.noise) {
      const source = g.context.createBufferSource(),
        filter = g.context.createBiquadFilter(),
        gain = g.context.createGain(),
        at = g.context.currentTime;
      source.buffer = g.noise;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(cue === 'depart' ? 180 : 1200, at);
      filter.frequency.exponentialRampToValueAtTime(
        cue === 'depart' ? 700 : 600,
        at + 0.25,
      );
      filter.Q.value = 0.6;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.018, at + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(g.effects);
      g.voices.add(source);
      source.onended = () => {
        g.voices.delete(source);
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      source.start();
      source.stop(at + 0.35);
    }
  }, []);
  const toggle = useCallback(async () => {
    try {
      const g = await ensure();
      const next = !flags.current.effects;
      flags.current.effects = next;
      setEnabled(next);
      if (next) {
        g.effects.gain.setTargetAtTime(
          flags.current.volume,
          g.context.currentTime,
          0.008,
        );
        play('click');
      }
    } catch {
      setEnabled(false);
      flags.current.effects = false;
      setError('Audio could not start. Try enabling it again.');
    }
  }, [ensure, play]);
  const toggleMusic = useCallback(async () => {
    try {
      await ensure();
      const next = !flags.current.music;
      flags.current.music = next;
      setMusicEnabled(next);
    } catch {
      setMusicEnabled(false);
      flags.current.music = false;
      setError('Music could not start. Try enabling it again.');
    }
  }, [ensure]);
  useEffect(() => {
    const g = graph.current;
    if (!g) return;
    const now = g.context.currentTime;
    g.effects.gain.setTargetAtTime(enabled ? volume : 0, now, 0.06);
    g.music.gain.setTargetAtTime(
      musicEnabled ? musicVolume * (reading ? 0.3 : 1) : 0,
      now,
      musicEnabled ? 0.25 : 0.08,
    );
    if (!enabled && !musicEnabled) {
      idleTimer.current = setTimeout(() => {
        if (!flags.current.effects && !flags.current.music)
          void g.context.suspend().catch(() => {});
      }, 700);
    }
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [enabled, musicEnabled, volume, musicVolume, reading]);
  useEffect(() => {
    const g = graph.current;
    if (!g || !musicEnabled) return;
    let cursor = 0,
      origin = g.context.currentTime + 0.08;
    const schedule = () => {
      if (document.hidden || g.context.state !== 'running') return;
      while (origin + musicEvent(cursor).at < g.context.currentTime + 0.75) {
        const event = musicEvent(cursor++),
          at = origin + event.at;
        event.notes.forEach((frequency, i) => {
          const osc = g.context.createOscillator(),
            gain = g.context.createGain();
          osc.type = event.kind === 'pad' ? 'triangle' : 'sine';
          osc.frequency.value = frequency;
          osc.detune.value = event.kind === 'pad' ? (i % 2 === 0 ? -2 : 2) : 0;
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(
            event.gain,
            at + (event.kind === 'pad' ? 2.4 : 0.025),
          );
          gain.gain.exponentialRampToValueAtTime(0.0001, at + event.duration);
          osc.connect(gain);
          gain.connect(g.music);
          g.musicVoices.add(osc);
          osc.onended = () => {
            g.musicVoices.delete(osc);
            osc.disconnect();
            gain.disconnect();
          };
          osc.start(at);
          osc.stop(at + event.duration + 0.05);
        });
      }
    };
    schedule();
    const timer = setInterval(schedule, 250);
    return () => {
      clearInterval(timer);
      for (const voice of g.musicVoices) {
        try {
          voice.stop(g.context.currentTime + 0.65);
        } catch {}
      }
    };
  }, [musicEnabled]);
  useEffect(() => {
    const change = () => {
      const g = graph.current;
      if (!g) return;
      if (document.hidden) void g.context.suspend().catch(() => {});
      else if (flags.current.effects || flags.current.music)
        void g.context.resume().catch(() => {
          setError('Resume audio with the sound controls.');
          setEnabled(false);
          setMusicEnabled(false);
        });
    };
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      const g = graph.current;
      if (g) {
        for (const v of [...g.voices, ...g.musicVoices]) {
          try {
            v.stop();
          } catch {}
        }
        void g.context.close();
        graph.current = null;
      }
    },
    [],
  );
  const setVolume = (v: number) => {
    v = bounded(v);
    setVolumeState(v);
    writeLocal('cabin-volume', v);
  };
  const setMusicVolume = (v: number) => {
    v = bounded(v);
    setMusicVolumeState(v);
    writeLocal('cabin-music-volume', v);
  };
  return {
    enabled,
    musicEnabled,
    volume,
    musicVolume,
    error,
    setVolume,
    setMusicVolume,
    toggle,
    toggleMusic,
    play,
  };
}
