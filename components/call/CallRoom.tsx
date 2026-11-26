"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Settings2,
  Video,
  VideoOff,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";

import { interviewer } from "@/constants";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";
import { readPrefs, writePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/Logo";
import Orb from "@/components/call/Orb";
import VoiceRibbon from "@/components/brand/VoiceRibbon";
import { playTestSound, useCamera, useDevices, useMicLevel, useTimer } from "@/components/call/useMedia";
import { Avatar, AvatarFallback, AvatarImage, initials } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Stage = "lobby" | "connecting" | "live" | "analyzing" | "creating" | "error";
type ErrorKind = "empty" | "feedback" | "call" | "mic";
type Line = { role: "user" | "assistant" | "system"; content: string; at: number };

export type CallRoomProps = {
  mode: "interview" | "generate";
  user: { id: string; name: string; profileURL?: string };
  interview?: Pick<Interview, "id" | "role" | "level" | "type" | "questions" | "techstack">;
  feedbackId?: string;
  preview?: "lobby" | "live" | "analyzing" | "error";
  previewLines?: { role: string; content: string }[];
};

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function CallRoom({ mode, user, interview, feedbackId, preview, previewLines }: CallRoomProps) {
  const router = useRouter();
  const prefs = useMemo(() => readPrefs(), []);
  const isPreview = !!preview;

  const [stage, setStage] = useState<Stage>(preview === "live" ? "live" : preview === "analyzing" ? "analyzing" : preview === "error" ? "error" : "lobby");
  const [errorKind, setErrorKind] = useState<ErrorKind>("empty");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(prefs.joinWithCamera);
  const [micId, setMicId] = useState(prefs.micId);
  const [camId, setCamId] = useState(prefs.camId);
  const [speakerId, setSpeakerId] = useState(prefs.speakerId);
  const [aiSpeaking, setAiSpeaking] = useState(preview === "live");
  const [drawer, setDrawer] = useState(true);
  const [online, setOnline] = useState(true);
  // Transcript panel starts open on desktop, closed on phones and tablets.
  useEffect(() => { setDrawer(window.matchMedia("(min-width: 1024px)").matches); }, []);
  const [lines, setLines] = useState<Line[]>(
    () => previewLines?.map((l, i) => ({ role: l.role as Line["role"], content: l.content, at: 4000 + i * 21000 })) ?? [],
  );
  const startedAt = useRef<number>(0);
  const linesRef = useRef<Line[]>(lines);
  linesRef.current = lines;
  const orbRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef(0);
  const meterRef = useRef<HTMLDivElement>(null);
  const endedByUser = useRef(false);

  const live = stage === "live" || stage === "connecting";
  const timer = useTimer(stage === "live" && !isPreview);
  const timerLabel = isPreview && stage === "live" ? "08:42" : timer.label;

  // Media: camera preview in lobby and during the call; mic meter only in the lobby
  // (Vapi opens its own microphone stream once the call starts).
  const cam = useCamera(camOn && (stage === "lobby" || live) && !isPreview, camId);
  const micPermission = useMicLevel(stage === "lobby" && micOn && !isPreview, micId, (v) => {
    const bars = meterRef.current?.children;
    if (!bars) return;
    for (let i = 0; i < bars.length; i++) (bars[i] as HTMLElement).dataset.on = String(v > (i + 0.5) / bars.length);
  });
  const devices = useDevices(micPermission === "granted" || !!cam.stream);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // ---- Vapi wiring -------------------------------------------------------
  useEffect(() => {
    if (isPreview) return;
    const onStart = () => {
      startedAt.current = Date.now();
      setStage("live");
      if (!micOn) vapi.setMuted(true);
    };
    const onEnd = () => {
      if (mode === "generate") {
        setStage("creating");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1800);
        return;
      }
      void finish();
    };
    const onMessage = (m: Message) => {
      if (m.type === "transcript" && m.transcriptType === "final") {
        setLines((prev) => [...prev, { role: m.role, content: m.transcript, at: Date.now() - startedAt.current }]);
      }
    };
    const onSpeechStart = () => setAiSpeaking(true);
    const onSpeechEnd = () => {
      setAiSpeaking(false);
      orbRef.current?.style.setProperty("--level", "0");
      levelRef.current = 0;
    };
    const onVolume = (v: number) => {
      levelRef.current = Math.min(1, v * 1.6);
      orbRef.current?.style.setProperty("--level", String(levelRef.current));
    };
    const onError = (e: unknown) => {
      console.error("Vapi error", e);
      if (!endedByUser.current) {
        setErrorKind("call");
        setStage("error");
      }
    };
    vapi.on("call-start", onStart);
    vapi.on("call-end", onEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("volume-level", onVolume);
    vapi.on("error", onError);
    return () => {
      vapi.off("call-start", onStart);
      vapi.off("call-end", onEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("volume-level", onVolume);
      vapi.off("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreview, mode]);

  // Leaving the page ends the call.
  useEffect(() => () => {
    if (!isPreview) {
      try {
        vapi.stop();
      } catch {}
    }
  }, [isPreview]);

  // Simulated voice level in preview so the orb is alive in screenshots/design review.
  useEffect(() => {
    if (!isPreview || stage !== "live") return;
    let t = 0;
    const id = setInterval(() => {
      t += 0.35;
      levelRef.current = Math.abs(Math.sin(t)) * 0.6;
      orbRef.current?.style.setProperty("--level", String(levelRef.current));
    }, 120);
    return () => clearInterval(id);
  }, [isPreview, stage]);

  const finish = useCallback(async () => {
    setStage("analyzing");
    const transcript = linesRef.current.map(({ role, content }) => ({ role, content }));
    if (!transcript.some((t) => t.role === "user")) {
      setErrorKind("empty");
      setStage("error");
      return;
    }
    const res = await createFeedback({ interviewId: interview!.id, userId: user.id, transcript, feedbackId });
    if (res.success && "feedbackId" in res && res.feedbackId) {
      router.push(`/interview/${interview!.id}/feedback`);
      router.refresh();
    } else {
      setErrorKind("feedback");
      setStage("error");
    }
  }, [feedbackId, interview, router, user.id]);

  const join = async () => {
    if (isPreview) return setStage("live");
    endedByUser.current = false;
    setLines([]);
    setStage("connecting");
    writePrefs({ micId, camId, speakerId });
    try {
      if (micId) vapi.setInputDevicesAsync({ audioDeviceId: micId });
      if (speakerId) vapi.setOutputDeviceAsync({ outputDeviceId: speakerId });
    } catch {}
    try {
      if (mode === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, { variableValues: { username: user.name, userid: user.id } });
      } else {
        const questions = (interview?.questions || []).map((q) => `- ${q}`).join("\n");
        await vapi.start(interviewer, { variableValues: { questions } });
      }
    } catch (e) {
      console.error(e);
      setErrorKind("call");
      setStage("error");
    }
  };

  const end = () => {
    endedByUser.current = true;
    if (isPreview) return setStage("analyzing");
    try {
      vapi.stop();
    } catch {
      void finish();
    }
  };

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    if (live && !isPreview) vapi.setMuted(!next);
  };

  // Rough question tracker: counts interviewer turns that ask something.
  const total = interview?.questions?.length || 0;
  const asked = lines.filter((l) => l.role === "assistant" && l.content.includes("?")).length;
  const current = total ? Math.min(total, Math.max(1, asked)) : 0;
  const lastLine = [...lines].reverse().find((l) => l.role === "assistant");
  const title = mode === "generate" ? "Set up an interview by voice" : `${interview?.role} interview`;

  const deviceControls = (
    <DeviceSelects
      devices={devices}
      micId={micId}
      camId={camId}
      speakerId={speakerId}
      onMic={(id) => {
        setMicId(id);
        writePrefs({ micId: id });
        if (live && !isPreview) vapi.setInputDevicesAsync({ audioDeviceId: id });
      }}
      onCam={(id) => {
        setCamId(id);
        writePrefs({ camId: id });
      }}
      onSpeaker={(id) => {
        setSpeakerId(id);
        writePrefs({ speakerId: id });
        if (live && !isPreview) vapi.setOutputDeviceAsync({ outputDeviceId: id });
      }}
    />
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Top bar */}
      <header className="no-print flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
        {stage === "lobby" || stage === "error" ? (
          <Button asChild variant="ghost" size="icon-sm" aria-label="Back to dashboard">
            <Link href="/dashboard">
              <ArrowLeft />
            </Link>
          </Button>
        ) : (
          <LogoMark className="size-7" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          {interview && (
            <p className="truncate text-xs text-muted-foreground">
              {interview.level} · {interview.type} · {total} questions
            </p>
          )}
        </div>
        {live && total > 0 && (
          <div className="hidden items-center gap-2 sm:flex" aria-label={`Question ${current} of ${total}`}>
            <span className="num text-xs text-muted-foreground">
              Q{current} of {total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={cn("h-1.5 w-4 rounded-full", i < current ? "bg-brand" : "bg-muted")} />
              ))}
            </div>
          </div>
        )}
        {live && <ConnectionPill stage={stage} online={online} />}
        {live && (
          <span className="num rounded-md border bg-card px-2 py-1 text-sm" aria-label="Elapsed time">
            {timerLabel}
          </span>
        )}
      </header>

      {stage === "lobby" && (
        <Lobby
          user={user}
          interview={interview}
          mode={mode}
          camOn={camOn}
          micOn={micOn}
          stream={cam.stream}
          camError={cam.error}
          micPermission={isPreview ? "granted" : micPermission}
          meterRef={meterRef}
          onToggleCam={() => setCamOn((v) => !v)}
          onToggleMic={() => setMicOn((v) => !v)}
          onJoin={join}
          deviceControls={deviceControls}
          speakerId={speakerId}
        />
      )}

      {live && (
        <div className="flex min-h-0 flex-1">
          <main className="relative flex min-w-0 flex-1 flex-col p-3 sm:p-5">
            {/* Stage: the interviewer is the room */}
            <section className="bg-night relative flex min-h-[420px] flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] border bg-surface" aria-label="AI interviewer">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-56 -translate-y-1/2 opacity-80 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                <VoiceRibbon strands={6} amplitude={0.34} pointer={false} getLevel={() => levelRef.current} />
              </div>
              <Orb ref={orbRef} state={stage === "connecting" ? "connecting" : aiSpeaking ? "speaking" : "listening"} size={200} />
              <p className="glass relative mt-8 rounded-full px-3.5 py-1.5 text-sm font-medium" aria-live="polite">
                {stage === "connecting" ? "Connecting to your interviewer" : aiSpeaking ? "Interviewer is speaking" : "Your turn. Take your time."}
              </p>

              {/* Self view, floating */}
              <div className="absolute top-3 right-3 aspect-[4/3] w-28 overflow-hidden rounded-2xl border bg-card shadow-xl sm:top-4 sm:right-4 sm:w-52" aria-label="Your camera">
                {camOn && cam.stream ? (
                  <VideoView stream={cam.stream} />
                ) : (
                  <div className="grid size-full place-items-center">
                    <Avatar className="size-12 sm:size-16">
                      {user.profileURL && <AvatarImage src={user.profileURL} alt="" />}
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[11px] font-medium backdrop-blur">
                  {!micOn && <MicOff className="size-3 text-destructive" />} You
                </span>
              </div>

              {/* Captions, like subtitles */}
              {prefs.captions && lastLine && stage === "live" && (
                <div className="absolute inset-x-3 bottom-4 flex justify-center sm:bottom-6">
                  <p className="glass line-clamp-3 max-w-2xl rounded-2xl px-5 py-3 text-center text-[15px] leading-relaxed">
                    <span className="mr-2 font-medium text-brand-strong">Interviewer</span>
                    {lastLine.content}
                  </p>
                </div>
              )}
            </section>
          </main>

          {drawer && (
            <aside className="fixed inset-x-0 bottom-0 z-30 flex h-[62dvh] flex-col pb-20 lg:pb-0 rounded-t-3xl border-t bg-card shadow-2xl lg:static lg:h-auto lg:w-[380px] lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none">
              <Tabs defaultValue="transcript" className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center gap-2 border-b p-3">
                  <TabsList className="flex-1">
                    <TabsTrigger value="transcript" className="flex-1">Transcript</TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1">Scratchpad</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="icon-sm" aria-label="Close panel" onClick={() => setDrawer(false)}>
                    <X />
                  </Button>
                </div>
                <TabsContent value="transcript" className="min-h-0 flex-1">
                  <Transcript lines={lines} userName={user.name} />
                </TabsContent>
                <TabsContent value="notes" className="min-h-0 flex-1 p-3">
                  <Scratchpad id={interview?.id || "setup"} />
                </TabsContent>
              </Tabs>
            </aside>
          )}
        </div>
      )}

      {live && (
        <footer className="no-print sticky bottom-0 z-40 flex justify-center px-3 pt-1 pb-4">
          <div className="glass flex items-center gap-1.5 rounded-2xl p-1.5 sm:gap-2 sm:p-2">
            <DockButton label={micOn ? "Mute microphone" : "Unmute microphone"} active={micOn} onClick={toggleMic}>
              {micOn ? <Mic /> : <MicOff />}
            </DockButton>
            <DockButton label={camOn ? "Turn camera off" : "Turn camera on"} active={camOn} onClick={() => setCamOn((v) => !v)}>
              {camOn ? <Video /> : <VideoOff />}
            </DockButton>
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" size="icon" aria-label="Device settings">
                      <Settings2 />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Devices</TooltipContent>
              </Tooltip>
              <PopoverContent side="top" className="w-80">
                <p className="mb-3 text-sm font-semibold">Devices</p>
                {deviceControls}
              </PopoverContent>
            </Popover>
            <DockButton label={drawer ? "Hide transcript" : "Show transcript"} active={drawer} pressed onClick={() => setDrawer((v) => !v)}>
              <MessageSquareText />
            </DockButton>
            <span className="mx-1 h-6 w-px bg-border" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2 px-4">
                  <PhoneOff />
                  <span className="hidden sm:inline">End</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>{mode === "generate" ? "End setup?" : "End the interview?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {mode === "generate"
                    ? "If you've answered the setup questions, your interview will be created."
                    : "We'll score what you've said so far and save the transcript with your report."}
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep going</AlertDialogCancel>
                  <AlertDialogAction onClick={end}>End interview</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </footer>
      )}

      {(stage === "analyzing" || stage === "creating") && <Analyzing creating={stage === "creating"} />}

      {stage === "error" && (
        <ErrorState
          kind={errorKind}
          onRetryScore={() => void finish()}
          onRejoin={() => setStage("lobby")}
          interviewId={interview?.id}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Lobby */

function Lobby(props: {
  user: CallRoomProps["user"];
  interview?: CallRoomProps["interview"];
  mode: CallRoomProps["mode"];
  camOn: boolean;
  micOn: boolean;
  stream: MediaStream | null;
  camError: string | null;
  micPermission: string;
  meterRef: React.RefObject<HTMLDivElement | null>;
  onToggleCam: () => void;
  onToggleMic: () => void;
  onJoin: () => void;
  deviceControls: React.ReactNode;
  speakerId?: string;
}) {
  const { user, interview, mode, camOn, micOn, stream, camError, micPermission } = props;
  const minutes = interview ? Math.max(5, Math.round((interview.questions?.length || 5) * 2.5)) : 3;
  const denied = micPermission === "denied";
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
      <div>
        <div className="relative aspect-video overflow-hidden rounded-[28px] border bg-surface">
          {camOn && stream ? (
            <VideoView stream={stream} />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3">
              <Avatar className="size-20">
                {user.profileURL && <AvatarImage src={user.profileURL} alt="" />}
                <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                {camError === "denied" ? "Camera access is blocked" : camOn ? "Starting camera" : "Camera is off"}
              </p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/55 to-transparent p-3 sm:p-4">
            <div ref={props.meterRef} className="flex h-6 items-end gap-[3px]" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="w-1 rounded-full bg-white/35 transition-colors duration-75 data-[on=true]:bg-white" style={{ height: `${30 + ((i * 37) % 70)}%` }} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="icon" aria-label={micOn ? "Turn microphone off" : "Turn microphone on"} aria-pressed={micOn} onClick={props.onToggleMic} className={cn("rounded-full", micOn ? "bg-white/90 text-black hover:bg-white" : "bg-destructive text-white hover:bg-destructive/90")}>
                {micOn ? <Mic /> : <MicOff />}
              </Button>
              <Button size="icon" aria-label={camOn ? "Turn camera off" : "Turn camera on"} aria-pressed={camOn} onClick={props.onToggleCam} className={cn("rounded-full", camOn ? "bg-white/90 text-black hover:bg-white" : "bg-destructive text-white hover:bg-destructive/90")}>
                {camOn ? <Video /> : <VideoOff />}
              </Button>
            </div>
          </div>
        </div>
        {denied && (
          <div role="alert" className="mt-4 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium">Examify needs your microphone</p>
              <p className="mt-1 text-muted-foreground">Allow microphone access from the icon in your browser&apos;s address bar, then reload this page.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="type-page">
            {mode === "generate" ? "Tell us what to practice" : "Ready when you are"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {mode === "generate"
              ? "Answer a few quick questions out loud. We'll build your interview from what you say."
              : `${interview?.questions?.length ?? 0} questions · about ${minutes} minutes. Speak naturally; the interviewer waits for you to finish.`}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">{props.deviceControls}</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="xl" variant="brand" className="sm:flex-1" onClick={props.onJoin} disabled={denied}>
            {mode === "generate" ? "Start setup call" : "Join interview"}
          </Button>
          <Button size="xl" variant="outline" onClick={() => playTestSound(props.speakerId)}>
            <Volume2 /> Test speaker
          </Button>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          {["Use headphones to avoid echo", "Find a quiet room", "Your camera stays on your device; only audio is sent"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="size-4 text-success" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- Parts */

function DeviceSelects({ devices, micId, camId, speakerId, onMic, onCam, onSpeaker }: {
  devices: ReturnType<typeof useDevices>;
  micId?: string;
  camId?: string;
  speakerId?: string;
  onMic: (id: string) => void;
  onCam: (id: string) => void;
  onSpeaker: (id: string) => void;
}) {
  const rows: { label: string; list: MediaDeviceInfo[]; value?: string; on: (id: string) => void; fallback: string }[] = [
    { label: "Microphone", list: devices.mics, value: micId, on: onMic, fallback: "Default microphone" },
    { label: "Camera", list: devices.cams, value: camId, on: onCam, fallback: "Default camera" },
    { label: "Speaker", list: devices.speakers, value: speakerId, on: onSpeaker, fallback: "System default" },
  ];
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <label key={r.label} className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          {r.label}
          <Select value={r.value && r.list.some((d) => d.deviceId === r.value) ? r.value : undefined} onValueChange={r.on} disabled={!r.list.length}>
            <SelectTrigger aria-label={r.label} className="text-foreground">
              <SelectValue placeholder={r.list.length ? r.list[0].label || r.fallback : r.fallback} />
            </SelectTrigger>
            <SelectContent>
              {r.list.map((d, i) => (
                <SelectItem key={d.deviceId} value={d.deviceId}>
                  {d.label || `${r.label} ${i + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      ))}
    </div>
  );
}

function VideoView({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" />;
}


function ConnectionPill({ stage, online }: { stage: Stage; online: boolean }) {
  if (!online)
    return (
      <Badge variant="destructive">
        <WifiOff /> Offline
      </Badge>
    );
  if (stage === "connecting")
    return (
      <Badge variant="warning">
        <Loader2 className="animate-spin" /> Connecting
      </Badge>
    );
  return (
    <Badge variant="success">
      <span className="size-1.5 rounded-full bg-success" /> Live
    </Badge>
  );
}

function DockButton({ label, active, pressed, onClick, children }: { label: string; active: boolean; pressed?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          variant={active ? "secondary" : pressed ? "ghost" : "destructive"}
          className={cn(!active && !pressed && "bg-destructive-soft text-destructive hover:bg-destructive-soft/80")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Transcript({ lines, userName }: { lines: Line[]; userName: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [lines.length]);
  if (!lines.length)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <MessageSquareText className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">The transcript appears here</p>
        <p className="text-sm text-muted-foreground">Every line is saved with your report.</p>
      </div>
    );
  return (
    <ol className="h-full space-y-4 overflow-y-auto p-4" aria-live="polite">
      {lines.map((l, i) => (
        <li key={i} className="text-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn("font-medium", l.role === "assistant" ? "text-brand-strong" : "text-foreground")}>
              {l.role === "assistant" ? "Interviewer" : userName.split(" ")[0]}
            </span>
            <span className="num text-xs text-muted-foreground">{fmt(l.at)}</span>
          </div>
          <p className="leading-relaxed text-muted-foreground">{l.content}</p>
        </li>
      ))}
      <div ref={end} />
    </ol>
  );
}

function Scratchpad({ id }: { id: string }) {
  const key = `examify:notes:${id}`;
  const [value, setValue] = useState("");
  useEffect(() => { setValue(localStorage.getItem(key) || ""); }, [key]);
  return (
    <div className="flex h-full flex-col gap-2">
      <Textarea
        aria-label="Scratchpad"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          localStorage.setItem(key, e.target.value);
        }}
        placeholder="Jot down key points before you answer. Notes stay on this device."
        className="flex-1 resize-none font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">Saved on this device only.</p>
    </div>
  );
}

function Analyzing({ creating }: { creating: boolean }) {
  const steps = creating
    ? ["Reading your answers", "Generating questions", "Saving your interview"]
    : ["Saving your transcript", "Scoring five categories", "Writing your report"];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(steps.length - 1, s + 1)), 2600);
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center" aria-live="polite">
      <Orb state="thinking" size={140} />
      <h1 className="mt-8 text-2xl font-semibold tracking-[-0.02em]">{creating ? "Building your interview" : "Analyzing your interview"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{creating ? "Taking you to your dashboard in a moment." : "This usually takes 15 to 30 seconds."}</p>
      <ol className="mt-8 flex w-full max-w-xs flex-col gap-3 text-left">
        {steps.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-3 text-sm", i > step && "text-muted-foreground")}>
            <span className={cn("grid size-6 place-items-center rounded-full border", i < step && "border-success bg-success text-white", i === step && "border-brand")}>
              {i < step ? <Check className="size-3.5" /> : i === step ? <Loader2 className="size-3.5 animate-spin text-brand" /> : null}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </main>
  );
}

function ErrorState({ kind, onRetryScore, onRejoin, interviewId }: { kind: ErrorKind; onRetryScore: () => void; onRejoin: () => void; interviewId?: string }) {
  const copy = {
    empty: { t: "We didn't hear any answers", d: "The call ended before you answered a question, so there's nothing to score yet.", a: "Try again", fn: onRejoin },
    feedback: { t: "We couldn't score this interview", d: "Your transcript is safe in this tab. Retry scoring, and if it keeps failing, try again in a few minutes.", a: "Retry scoring", fn: onRetryScore },
    call: { t: "The call couldn't connect", d: "Check your internet connection and microphone, then rejoin. Nothing was saved from this attempt.", a: "Rejoin", fn: onRejoin },
    mic: { t: "Microphone unavailable", d: "Allow microphone access in your browser settings, then rejoin.", a: "Rejoin", fn: onRejoin },
  }[kind];
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center" role="alert">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive-soft text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">{copy.t}</h1>
      <p className="mt-2 max-w-md text-[15px] text-muted-foreground">{copy.d}</p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button size="lg" onClick={copy.fn}>
          <RotateCcw /> {copy.a}
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href={interviewId ? "/dashboard" : "/interview"}>Back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
