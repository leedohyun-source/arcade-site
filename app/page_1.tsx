"use client";

import { useEffect, useRef, useState } from "react";

const FPS = 24;

// ===== 프레임 → 초 변환 유틸 =====
const f2s = (frame: number) => frame / FPS;
// end frame 포함 구간을 "끝(배타)"로 만들기: (endFrame+1)/fps
const endEx = (endFrame: number) => (endFrame + 1) / FPS;

// ===== 영상 구간 =====
const PLAY1 = { start: 0, end: 141 };
const LOOP2 = { start: 142, end: 330 };
const PLAY3 = { start: 331, end: 606 };
const LOOP4 = { start: 607, end: 797 };
const PLAY5 = { start: 798, end: 893 };
// ✅ 엔드(셀렉트) 상태에서 3분할 호버 루프 구간
const HOVER_L = { start: 894, end: 917 };
const HOVER_C = { start: 918, end: 941 };
const HOVER_R = { start: 942, end: 965 };

// ===== 오디오 페이드 시간 =====
const FADE_SEC = 1.0;

// ✅ LOOP 기본 볼륨 (원하는 값으로 조절)
const LOOP_VOL = 0.4;
type Stage = "BG" | "MAIN";
type Phase = "PLAY1" | "LOOP2" | "PLAY3" | "LOOP4" | "PLAY5";

type HoverZone = "LEFT" | "CENTER" | "RIGHT" | null;

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // ✅ object-contain일 때 실제 영상이 그려지는 영역(레터박스 제외)을 계산해서,
  // 마스크 딤/이펙트를 "영상 박스"에만 적용하기 위한 값
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoBox, setVideoBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);


  // ✅ 부팅(프리로드) 로딩 UI
  const [bootLoading, setBootLoading] = useState(true);
  const [bootProgress, setBootProgress] = useState(0); // 0~100

  // ===== BGM_LOOP: WebAudio seamless loop =====
  const audioCtxRef = useRef<AudioContext | null>(null);
  const loopGainRef = useRef<GainNode | null>(null);
  const loopSrcRef = useRef<AudioBufferSourceNode | null>(null);
  const loopBufRef = useRef<AudioBuffer | null>(null);
  const loopLoadingRef = useRef<Promise<void> | null>(null);

  // ===== BGM_ENTER: HTMLAudioElement =====
  const bgmEnterRef = useRef<HTMLAudioElement>(null);

  const stageRef = useRef<Stage>("BG");
  const phaseRef = useRef<Phase>("PLAY1");

  const [stage, setStage] = useState<Stage>("BG");
  const [phase, setPhase] = useState<Phase>("PLAY1");

  const [showDown, setShowDown] = useState(false);
  const [showEnterBtn, setShowEnterBtn] = useState(false);

  const enterMusicTriggeredRef = useRef(false);

  // ✅ 엔드(셀렉트) 오버레이 상태
  const [showSelectImg, setShowSelectImg] = useState(false);
  const showSelectImgRef = useRef(false);

  const [selectImgVisible, setSelectImgVisible] = useState(false);

  // ✅ 3분할 호버 상태 (셀렉트 단계에서만 사용)
  const [hoverZone, setHoverZone] = useState<HoverZone>(null);
  const hoverZoneRef = useRef<HoverZone>(null);

  // ✅ 부드러운 디졸브(페이드) 레이어: 호버 구간 전환 시 잠깐 검정으로 크로스페이드
  const [hoverFade, setHoverFade] = useState(0); // 0~1

  // showSelectImg가 켜질 때, CSS transition을 위해 1프레임 뒤 opacity를 올림
  useEffect(() => {
    showSelectImgRef.current = showSelectImg;
    if (showSelectImg) {
      setSelectImgVisible(false);
      const id = requestAnimationFrame(() => setSelectImgVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setSelectImgVisible(false);
    }
  }, [showSelectImg]);

  // hoverZone state와 ref 동기화
  useEffect(() => {
    hoverZoneRef.current = hoverZone;
  }, [hoverZone]);

  // ✅ SKIP 전환(암전) 상태
  const [isSkipFading, setIsSkipFading] = useState(false);
  const skipLockRef = useRef(false);

  const setStageSafe = (s: Stage) => {
    stageRef.current = s;
    setStage(s);
  };

  const setPhaseSafe = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);

    // 버튼 노출은 phase로만 결정
    setShowDown(p === "LOOP2");
    setShowEnterBtn(p === "LOOP4");

    // 다른 페이즈로 이동하면(=리플레이 등) 셀렉트/호버 상태 초기화
    if (p !== "PLAY5") {
      setHoverZone(null);
      setShowSelectImg(false);
    }
  };

  // ✅ 영상 박스 계산 (object-contain 기준)
  useEffect(() => {
    const el = containerRef.current;
    const v = videoRef.current;
    if (!el || !v) return;

    let raf = 0;

    const update = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;

      // 메타데이터 로드 전이면 계산 불가
      const vw = v.videoWidth || 0;
      const vh = v.videoHeight || 0;
      if (!cw || !ch || !vw || !vh) {
        setVideoBox(null);
        return;
      }

      const videoAR = vw / vh;
      const containerAR = cw / ch;

      let width = cw;
      let height = ch;

      // object-contain
      if (containerAR > videoAR) {
        // 컨테이너가 더 넓음 → 높이에 맞추고 좌우 레터박스
        height = ch;
        width = Math.round(ch * videoAR);
      } else {
        // 컨테이너가 더 좁음 → 너비에 맞추고 상하 레터박스
        width = cw;
        height = Math.round(cw / videoAR);
      }

      const left = Math.round((cw - width) / 2);
      const top = Math.round((ch - height) / 2);

      setVideoBox({ left, top, width, height });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    // resize 대응
    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    // 메타데이터 로드/소스 변경 대응
    const onMeta = () => schedule();
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("loadeddata", onMeta);

    // 초기
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("loadeddata", onMeta);
    };
  }, [stage, bootLoading]);


  // ===== HTMLAudio(ENTER) 페이드 유틸 =====
  const fadeVolume = (audio: HTMLAudioElement, from: number, to: number, sec: number) => {
    const start = performance.now();
    audio.volume = from;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (sec * 1000));
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ===== WebAudio(BGM_LOOP) =====
  const ensureAudioCtx = async () => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = LOOP_VOL; // ✅ 기본 볼륨
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      loopGainRef.current = gain;
    }
    if (audioCtxRef.current.state !== "running") {
      await audioCtxRef.current.resume();
    }
  };

  const loadLoopBuffer = async () => {
    if (loopBufRef.current) return;
    if (loopLoadingRef.current) return loopLoadingRef.current;

    loopLoadingRef.current = (async () => {
      const ctx = audioCtxRef.current!;
      const res = await fetch("/videos/BGM_LOOP.wav");
      const arr = await res.arrayBuffer();
      loopBufRef.current = await ctx.decodeAudioData(arr);
    })();

    await loopLoadingRef.current;
    loopLoadingRef.current = null;
  };

  const startSeamlessLoop = (opts?: { loopStartSec?: number; loopEndSec?: number }) => {
    const ctx = audioCtxRef.current!;
    const gain = loopGainRef.current!;
    const buf = loopBufRef.current!;

    // 기존 source 정리
    try {
      loopSrcRef.current?.stop();
    } catch {}
    try {
      loopSrcRef.current?.disconnect();
    } catch {}

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    if (opts?.loopStartSec != null) src.loopStart = opts.loopStartSec;
    if (opts?.loopEndSec != null) src.loopEnd = opts.loopEndSec;

    src.connect(gain);
    src.start();

    loopSrcRef.current = src;
  };

  const fadeLoopGain = (to: number, sec: number) => {
    const ctx = audioCtxRef.current!;
    const gain = loopGainRef.current!;
    const now = ctx.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(to, now + sec);
  };

  const stopLoopAfterFade = (sec: number) => {
    if (!audioCtxRef.current || !loopGainRef.current) return;

    fadeLoopGain(0, sec);

    const ctx = audioCtxRef.current!;
    const src = loopSrcRef.current;
    if (src) {
      const t = ctx.currentTime + sec + 0.03;
      try {
        src.stop(t);
      } catch {}
    }
  };

  const hardStopLoop = () => {
    try {
      loopSrcRef.current?.stop();
    } catch {}
    try {
      loopSrcRef.current?.disconnect();
    } catch {}

    loopSrcRef.current = null;

    if (audioCtxRef.current && loopGainRef.current) {
      const ctx = audioCtxRef.current;
      const gain = loopGainRef.current;
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(LOOP_VOL, now); // ✅ 리셋도 원하는 볼륨
    }
  };

  // ✅ 부팅 프리로드: BG 첫 프레임 준비 + intro/audio 캐시 워밍
  useEffect(() => {
  let cancelled = false;

  const preload = async () => {
    try {
      const v = videoRef.current;
      if (!v) return;

      // BG 메타데이터까지만 준비 (모바일 안정)
      v.src = "/videos/BG01.mp4";
      v.loop = true;
      v.muted = true;
      v.currentTime = 0;
      v.load(); // 모바일에서 이벤트 안 뜨는 것 방지

      const waitBGReady = new Promise<void>((resolve) => {
        const onReady = () => {
          v.removeEventListener("loadedmetadata", onReady);
          resolve();
        };
        v.addEventListener("loadedmetadata", onReady);
      });

      // 🔑 모바일에서는 큰 mp4 프리로드 안 함 (오디오만)
      const assets = ["/videos/BGM_LOOP.wav", "/videos/BGM_ENTER.mp3"];

      let done = 0;
      const total = assets.length + 1;

      const bump = () => {
        done += 1;
        const pct = Math.round((done / total) * 100);
        if (!cancelled) setBootProgress(pct);
      };

      // ⏱️ 4초 타임아웃 (어떤 경우든 멈추지 않게)
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 4000));

      await Promise.race([waitBGReady, timeout]);
      bump();

      await Promise.all(
        assets.map(async (url) => {
          try {
            await fetch(url, { cache: "force-cache" });
          } catch {}
          bump();
        })
      );

      if (!cancelled) {
        setBootLoading(false);
        v.play().catch(() => {});
      }
    } catch {
      if (!cancelled) setBootLoading(false);
    }
  };

  preload();

  return () => {
    cancelled = true;
  };
}, []);

  // ===== BG 화면 유지 =====
  useEffect(() => {
    if (bootLoading) return; // ✅ 프리로드 끝나기 전엔 여기서 덮어쓰지 않음
    if (stage !== "BG") return;

    const v = videoRef.current;
    if (!v) return;

    v.src = "/videos/BG01_v2.mp4";
    v.loop = true;
    v.muted = true;
    v.currentTime = 0;
    v.play().catch(() => {});

    // BG에서는 오디오 둘 다 정지
    hardStopLoop();

    const enter = bgmEnterRef.current;
    if (enter) {
      enter.pause();
      enter.currentTime = 0;
      enter.volume = 1;
    }

    enterMusicTriggeredRef.current = false;
    setPhaseSafe("PLAY1");
  }, [stage, bootLoading]);

  // ===== RAF 상태머신 =====
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const v = videoRef.current;
      if (!v) return;

      if (stageRef.current === "MAIN") {
        const t = v.currentTime;
        const p = phaseRef.current;

        // ✅ 셀렉트(엔드) 모드: 893f 고정 + 3분할 호버 루프
        if (showSelectImgRef.current) {
          const hz = hoverZoneRef.current;

          const seg =
            hz === "LEFT" ? HOVER_L : hz === "CENTER" ? HOVER_C : hz === "RIGHT" ? HOVER_R : null;

          if (!seg) {
            // 호버 없음 → 893f 고정 (영상 정지)
            if (!v.paused) v.pause();
            // 외부 요인으로 시간이 흘렀을 수 있으니 주기적으로 다시 고정
            if (Math.abs(v.currentTime - f2s(PLAY5.end)) > 0.0005) {
              v.currentTime = f2s(PLAY5.end);
            }
          } else {
            // 호버 중 → 해당 구간 루프
            if (t < f2s(seg.start) || t >= endEx(seg.end)) {
              v.currentTime = f2s(seg.start);
            }
            if (v.paused) {
              v.play().catch(() => {});
            }
          }

          raf = requestAnimationFrame(tick);
          return;
        }

        if (p === "PLAY1") {
          if (t >= endEx(PLAY1.end)) {
            v.currentTime = f2s(LOOP2.start);
            v.play().catch(() => {});
            setPhaseSafe("LOOP2");
          }
        } else if (p === "LOOP2") {
          if (t >= endEx(LOOP2.end)) {
            v.currentTime = f2s(LOOP2.start);
            v.play().catch(() => {});
          }
        } else if (p === "PLAY3") {
          if (t >= endEx(PLAY3.end)) {
            v.currentTime = f2s(LOOP4.start);
            v.play().catch(() => {});
            setPhaseSafe("LOOP4");
          }
        } else if (p === "LOOP4") {
          if (t >= endEx(LOOP4.end)) {
            v.currentTime = f2s(LOOP4.start);
            v.play().catch(() => {});
          }
        } else if (p === "PLAY5") {
          if (t >= endEx(PLAY5.end)) {
            // ✅ PLAY5 끝에서 영상 정지 + 셀렉트 이미지 디졸브
            v.pause();
            v.currentTime = f2s(PLAY5.end);
            setShowSelectImg(true);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 언마운트 시 AudioContext 정리
  useEffect(() => {
    return () => {
      try {
        hardStopLoop();
        audioCtxRef.current?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== ENTER 클릭: intro.mp4 시작 + BGM_LOOP 시작 =====
  const handleStartMain = async () => {
    // 로딩 중엔 클릭 막기 (안전)
    if (bootLoading) return;

    const v = videoRef.current;
    if (!v) return;

    setStageSafe("MAIN");
    setHoverZone(null);
    setShowSelectImg(false);
    setPhaseSafe("PLAY1");

    v.src = "/videos/intro_v4.mp4";
    v.loop = false;
    v.muted = false; // 나레이션 포함
    v.currentTime = f2s(PLAY1.start);

    // ENTER BGM 초기화
    enterMusicTriggeredRef.current = false;
    const enter = bgmEnterRef.current;
    if (enter) {
      enter.pause();
      enter.currentTime = 0;
      enter.volume = 1;
    }

    // WebAudio Loop 시작
    await ensureAudioCtx();
    await loadLoopBuffer();

    fadeLoopGain(LOOP_VOL, 0.01);
    startSeamlessLoop();

    await v.play().catch(() => {});
  };

  // ===== LOOP2의 ↓ 버튼: PLAY3로 점프 =====
  const handleDownToPlay3 = async () => {
    const v = videoRef.current;
    if (!v) return;

    setPhaseSafe("PLAY3");
    v.currentTime = f2s(PLAY3.start);
    await v.play().catch(() => {});
  };

  // ===== LOOP4의 ENTER 버튼: PLAY5로 점프 + 음악 트리거(한 번) =====
  const handleEnterToPlay5 = async () => {
    const v = videoRef.current;
    if (!v) return;

    setPhaseSafe("PLAY5");
    v.currentTime = f2s(PLAY5.start);
    await v.play().catch(() => {});

    if (!enterMusicTriggeredRef.current) {
      enterMusicTriggeredRef.current = true;

      stopLoopAfterFade(FADE_SEC);

      const enter = bgmEnterRef.current;
      if (enter) {
        enter.loop = false;
        enter.currentTime = 0;
        enter.volume = 0;
        enter.play().catch(() => {});
        fadeVolume(enter, 0, 1, FADE_SEC);
      }
    }
  };


// ✅ SKIP: 암전 → 음악 페이드아웃 종료 → 893f 고정 + 셀렉트 UI 진입 → 페이드인
const handleSkipToSelect = async () => {
  if (skipLockRef.current) return;
  skipLockRef.current = true;

  const v = videoRef.current;
  if (!v) {
    skipLockRef.current = false;
    return;
  }

  // 1) 화면 암전 시작
  setIsSkipFading(true);

  // 2) 현재 재생 중인 음악(루프/엔터)을 페이드아웃하며 종료
  // - LOOP 음악(WebAudio)
  try {
    stopLoopAfterFade(0.35);
  } catch {}

  // - ENTER 음악(HTMLAudio)
  const enter = bgmEnterRef.current;
  if (enter && !enter.paused) {
    const from = enter.volume ?? 1;
    fadeVolume(enter, from, 0, 0.35);
    setTimeout(() => {
      try {
        enter.pause();
        enter.currentTime = 0;
        enter.volume = 1;
      } catch {}
    }, 380);
  }

  // 3) 암전이 충분히 덮일 때까지 잠깐 대기
  await new Promise((r) => setTimeout(r, 260));

  // 4) PLAY5 마지막 프레임(893f)으로 고정 + 셀렉트 UI 오버레이
  setPhaseSafe("PLAY5");
  setHoverZone(null);
  v.pause();
  v.currentTime = f2s(PLAY5.end);
  setShowSelectImg(true);

  // 5) 페이드 인
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  setIsSkipFading(false);

  // 6) 연타 방지 해제
  setTimeout(() => {
    skipLockRef.current = false;
  }, 350);
};

  // ✅ REPLAY: 첫 화면 ENTER과 동일하게 처음부터 다시 실행
  const handleReplay = async () => {
    setHoverZone(null);
    setShowSelectImg(false);
    setIsSkipFading(false);
    skipLockRef.current = false;
    await handleStartMain();
  };

  // ✅ 셀렉트 상태에서 호버 구간 전환을 위한 크로스페이드(검정) 처리
  const hoverTransitionTimerRef = useRef<number | null>(null);

  const transitionHoverZone = (next: HoverZone) => {
    if (!showSelectImgRef.current) return;

    const prev = hoverZoneRef.current;
    if (prev === next) return;

    if (hoverTransitionTimerRef.current) {
      window.clearTimeout(hoverTransitionTimerRef.current);
      hoverTransitionTimerRef.current = null;
    }

    // 검정으로 살짝 덮었다가(seek 노이즈 감추기) 구간 전환
    setHoverFade(1);

    hoverTransitionTimerRef.current = window.setTimeout(() => {
      setHoverZone(next);

      const v = videoRef.current;
      if (v) {
        if (!next) {
          v.pause();
          v.currentTime = f2s(PLAY5.end);
        } else {
          const seg = next === "LEFT" ? HOVER_L : next === "CENTER" ? HOVER_C : HOVER_R;
          v.currentTime = f2s(seg.start);
          v.play().catch(() => {});
        }
      }

      requestAnimationFrame(() => setHoverFade(0));
      hoverTransitionTimerRef.current = null;
    }, 140);
  };

  // 클릭 핸들러 (원하는 라우팅/분기 로직으로 교체)
  const handleSelectClick = (z: Exclude<HoverZone, null>) => {
    // TODO: 여기서 router.push(...) 또는 분기 로직을 넣으면 됨
    console.log("selected:", z);
  };


  return (
    <main className="fixed inset-0 bg-black overflow-hidden"><div ref={containerRef} className="absolute inset-0">
      {/* ✅ 프리로딩 오버레이 */}
      {bootLoading && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="w-[320px] max-w-[80vw]">
            <div className="text-white/80 text-sm tracking-[0.22em] text-center mb-4">
              LOADING
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white/70 transition-[width] duration-300"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
            <div className="text-white/50 text-xs text-center mt-3">{bootProgress}%</div>
          </div>
        </div>
      )}

      {/* VIDEO */}
      <video
        ref={videoRef}
        preload="auto"
        className={[
          "absolute inset-0 w-full h-full",
          stage === "MAIN" ? "object-contain bg-black" : "object-cover",
        ].join(" ")}
        playsInline
      />


      {/* ✅ PLAY5 종료 후 셀렉트 이미지 오버레이 */}
      <img
        src="/images/select_img.jpg"
        alt="select"
        className={[
          "absolute inset-0 w-full h-full object-contain bg-black",
          "transition-opacity duration-500",
          showSelectImg && selectImgVisible && !hoverZone ? "opacity-100" : "opacity-0",
          "pointer-events-none",
        ].join(" ")}
        draggable={false}
      />

      {/* ✅ 호버 전환용 크로스페이드 레이어 */}
      <div
        className="absolute inset-0 z-20 bg-black transition-opacity duration-200 pointer-events-none"
        style={{ opacity: showSelectImg ? hoverFade : 0 }}
      />

      {/* ✅ 셀렉트 3분할 핫스팟 (세로 3등분) */}
      {stage === "MAIN" && showSelectImg && (
        <div
          className="absolute inset-0 z-30 flex"
          onMouseLeave={() => transitionHoverZone(null)}
        >
          <div
            className="flex-1"
            onMouseEnter={() => transitionHoverZone("LEFT")}
            onClick={() => handleSelectClick("LEFT")}
          />
          <div
            className="flex-1"
            onMouseEnter={() => transitionHoverZone("CENTER")}
            onClick={() => handleSelectClick("CENTER")}
          />
          <div
            className="flex-1"
            onMouseEnter={() => transitionHoverZone("RIGHT")}
            onClick={() => handleSelectClick("RIGHT")}
          />
        </div>
      )}


      {/* AUDIO (ENTER만) */}
      <audio ref={bgmEnterRef} src="/videos/BGM_ENTER.mp3" preload="auto" />

      {/* BG 어둡게 누르는 오버레이 */}
      {stage === "BG" && <div className="absolute inset-0 bg-black/50 pointer-events-none" />}

      {/* BG ENTER UI */}
      {stage === "BG" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-xs opacity-60 mb-1">Sound on</div>
          <div className="text-lg mb-6">소리를 켜세요</div>
          <button
            onClick={handleStartMain}
            className="px-10 py-3 border border-white/70 rounded-full tracking-widest hover:bg-white hover:text-black transition"
          >
            ENTER
          </button>
        </div>
      )}

      {/* LOOP2: ↓ 버튼 */}
      {stage === "MAIN" && showDown && (
        <button
          onClick={handleDownToPlay3}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition"
        >
          ↓
        </button>
      )}

      {/* LOOP4: ENTER 버튼 */}
      {stage === "MAIN" && showEnterBtn && (
        <button
          onClick={handleEnterToPlay5}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-3 border border-white/70 rounded-full tracking-widest text-white hover:bg-white hover:text-black transition"
        >
          ENTER
        </button>
      )}



{/* ✅ SKIP 버튼 (암전 후 선택 화면으로) */}
{stage === "MAIN" && !showSelectImg && (
  <button
    onClick={handleSkipToSelect}
    disabled={isSkipFading}
    className={[
      "absolute bottom-6 right-6 z-40 px-5 py-2 rounded-full",
      "border border-white/20 bg-black/35 backdrop-blur-md text-white tracking-widest text-sm",
      "hover:bg-white hover:text-black transition",
      isSkipFading ? "opacity-50 cursor-not-allowed" : "",
    ].join(" ")}
  >
    SKIP
  </button>
)}

{/* ✅ REPLAY 버튼 (셀렉트 상태에서 SKIP 자리 대체) */}
{stage === "MAIN" && showSelectImg && (
  <button
    onClick={handleReplay}
    disabled={isSkipFading}
    className={[
      "absolute bottom-6 right-6 z-40 px-5 py-2 rounded-full",
      "border border-white/20 bg-black/35 backdrop-blur-md text-white tracking-widest text-sm",
      "hover:bg-white hover:text-black transition",
      isSkipFading ? "opacity-50 cursor-not-allowed" : "",
    ].join(" ")}
  >
    REPLAY
  </button>
)}

      {/* ✅ SKIP 페이드(암전) 오버레이 */}
<div
  className={[
    "absolute inset-0 z-[80] bg-black pointer-events-none",
    "transition-opacity duration-300",
    isSkipFading ? "opacity-100" : "opacity-0",
  ].join(" ")}
/>

    </div>
    </main>
  );
}
