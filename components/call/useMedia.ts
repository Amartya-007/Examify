"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DeviceLists = { mics: MediaDeviceInfo[]; cams: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] };
export type Permission = "prompt" | "granted" | "denied" | "unsupported";

/** Enumerate input/output devices; labels appear once permission has been granted. */
export function useDevices(refreshKey: unknown) {
  const [devices, setDevices] = useState<DeviceLists>({ mics: [], cams: [], speakers: [] });
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const load = () =>
      navigator.mediaDevices.enumerateDevices().then((all) =>
        setDevices({
          mics: all.filter((d) => d.kind === "audioinput" && d.deviceId),
          cams: all.filter((d) => d.kind === "videoinput" && d.deviceId),
          speakers: all.filter((d) => d.kind === "audiooutput" && d.deviceId),
        }),
      );
    load();
    navigator.mediaDevices.addEventListener("devicechange", load);
    return () => navigator.mediaDevices.removeEventListener("devicechange", load);
  }, [refreshKey]);
  return devices;
}

/** Camera preview stream. Stops tracks on change and unmount. */
export function useCamera(enabled: boolean, deviceId?: string) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Permission | null>(null);
  useEffect(() => {
    if (!enabled) { setStream(null); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setError("unsupported"); return; }
    let active = true;
    let s: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: deviceId ? { deviceId: { exact: deviceId } } : { width: 1280, height: 720 }, audio: false })
      .then((st) => {
        if (!active) return st.getTracks().forEach((t) => t.stop());
        s = st;
        setStream(st);
        setError(null);
      })
      .catch((e: DOMException) => active && setError(e?.name === "NotAllowedError" ? "denied" : "unsupported"));
    return () => {
      active = false;
      s?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled, deviceId]);
  return { stream, error };
}

/** Microphone level meter (0-1) for the green room. Writes through a callback, not state. */
export function useMicLevel(enabled: boolean, deviceId: string | undefined, onLevel: (v: number) => void) {
  const [permission, setPermission] = useState<Permission>("prompt");
  const cb = useRef(onLevel);
  cb.current = onLevel;
  useEffect(() => {
    if (!enabled) {
      cb.current(0);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) { setPermission("unsupported"); return; }
    let raf = 0;
    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let alive = true;
    navigator.mediaDevices
      .getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true })
      .then((st) => {
        if (!alive) return st.getTracks().forEach((t) => t.stop());
        stream = st;
        setPermission("granted");
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(st).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (const v of data) sum += ((v - 128) / 128) ** 2;
          cb.current(Math.min(1, Math.sqrt(sum / data.length) * 4));
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
    };
  }, [enabled, deviceId]);
  return permission;
}

/** Elapsed mm:ss timer that runs while `running`. */
export function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = useCallback((s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`, []);
  return { seconds, label: fmt(seconds) };
}

/** Plays a short two-note chime through the chosen speaker. */
export async function playTestSound(speakerId?: string) {
  const audio = new Audio();
  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  gain.connect(dest);
  [660, 880].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.frequency.value = f;
    o.connect(gain);
    o.start(ctx.currentTime + i * 0.18);
    o.stop(ctx.currentTime + i * 0.18 + 0.16);
  });
  audio.srcObject = dest.stream;
  const a = audio as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };
  if (speakerId && a.setSinkId) await a.setSinkId(speakerId).catch(() => {});
  await audio.play().catch(() => {});
  setTimeout(() => ctx.close().catch(() => {}), 700);
}
