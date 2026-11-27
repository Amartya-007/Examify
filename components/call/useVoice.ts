"use client";

import { useEffect, useRef, useState } from "react";

export type VoicePermission = "idle" | "granted" | "denied" | "unsupported";

/**
 * Reads a microphone and exposes loudness (0-1) and pitch (0-1) through refs, so animation
 * loops can sample them every frame without React re-renders. Pitch is the spectral
 * centroid of the voice band, mapped on a log scale from about 110 Hz to 700 Hz.
 * Nothing is recorded or sent anywhere.
 */
export function useVoiceAnalyser(enabled: boolean, deviceId?: string) {
  const level = useRef(0);
  const pitch = useRef(0.45);
  const [permission, setPermission] = useState<VoicePermission>("idle");

  useEffect(() => {
    if (!enabled) {
      level.current = 0;
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission("unsupported");
      return;
    }
    let alive = true;
    let raf = 0;
    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId }, echoCancellation: true } : { echoCancellation: true } })
      .then((st) => {
        if (!alive) return st.getTracks().forEach((t) => t.stop());
        stream = st;
        setPermission("granted");
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.6;
        ctx.createMediaStreamSource(st).connect(analyser);
        const time = new Uint8Array(analyser.fftSize);
        const freq = new Uint8Array(analyser.frequencyBinCount);
        const binHz = ctx.sampleRate / analyser.fftSize;
        const lo = Math.floor(80 / binHz), hi = Math.ceil(1500 / binHz);
        const tick = () => {
          analyser.getByteTimeDomainData(time);
          let sum = 0;
          for (const v of time) sum += ((v - 128) / 128) ** 2;
          const rms = Math.sqrt(sum / time.length);
          level.current = Math.min(1, rms * 5);
          if (level.current > 0.04) {
            analyser.getByteFrequencyData(freq);
            let num = 0, den = 0;
            for (let i = lo; i <= hi; i++) {
              num += freq[i] * i * binHz;
              den += freq[i];
            }
            if (den > 0) {
              const centroid = num / den;
              const p = (Math.log(centroid) - Math.log(110)) / (Math.log(700) - Math.log(110));
              pitch.current += (Math.min(1, Math.max(0, p)) - pitch.current) * 0.25;
            }
          } else {
            pitch.current += (0.45 - pitch.current) * 0.02;
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch((e: DOMException) => alive && setPermission(e?.name === "NotAllowedError" ? "denied" : "unsupported"));

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ctx?.close().catch(() => {});
      stream?.getTracks().forEach((t) => t.stop());
      level.current = 0;
    };
  }, [enabled, deviceId]);

  return { level, pitch, permission };
}
