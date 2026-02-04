(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/ai/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AiPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function getYouTubeId(url) {
    try {
        const u = new URL(url);
        // youtu.be/<id>
        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.replace("/", "");
            return id || null;
        }
        // youtube.com/watch?v=<id>
        if (u.hostname.includes("youtube.com")) {
            const v = u.searchParams.get("v");
            if (v) return v;
            // youtube.com/embed/<id>
            const parts = u.pathname.split("/").filter(Boolean);
            const embedIdx = parts.indexOf("embed");
            if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
        }
        return null;
    } catch  {
        return null;
    }
}
function thumbUrl(id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
let ytApiPromise = null;
function loadYouTubeIframeApi() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve)=>{
        const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (existing) {
            // 이미 로드 중인 경우 ready 콜백만 대기
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = ()=>{
                prev?.();
                resolve();
            };
            return;
        }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        const first = document.getElementsByTagName("script")[0];
        first?.parentNode?.insertBefore(tag, first);
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = ()=>{
            prev?.();
            resolve();
        };
    });
    return ytApiPromise;
}
function AiPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // ✅ AI 카테고리 목록(여기에만 추가하면 됨)
    const items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AiPage.useMemo[items]": ()=>[
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=6gJSHnAfUeA",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=MKlCyrXsXAg",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=Fd2TOTgV3kQ",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=msGe62jaVDM",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=79C6Ws6Oo0I",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=sCuiAoy7OE0",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=XdOwfYu45XQ",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=7ezlVp3B_GA",
                    fallbackTitle: "YouTube Video"
                },
                {
                    youtubeUrl: "https://www.youtube.com/watch?v=dfrd_6zOmzI",
                    fallbackTitle: "YouTube Video"
                }
            ]
    }["AiPage.useMemo[items]"], []);
    const mapped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AiPage.useMemo[mapped]": ()=>{
            return items.map({
                "AiPage.useMemo[mapped]": (it)=>{
                    const id = getYouTubeId(it.youtubeUrl);
                    return {
                        ...it,
                        id
                    };
                }
            }["AiPage.useMemo[mapped]"]).filter({
                "AiPage.useMemo[mapped]": (it)=>it.id
            }["AiPage.useMemo[mapped]"]);
        }
    }["AiPage.useMemo[mapped]"], [
        items
    ]);
    const [openId, setOpenId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [titleMap, setTitleMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // ✅ 유튜브 실제 제목(oEmbed) 로드: API 키 필요 없음
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AiPage.useEffect": ()=>{
            let cancelled = false;
            const run = {
                "AiPage.useEffect.run": async ()=>{
                    const pairs = mapped.map({
                        "AiPage.useEffect.run.pairs": (it)=>({
                                id: it.id,
                                url: it.youtubeUrl,
                                fallback: it.fallbackTitle || "YouTube Video"
                            })
                    }["AiPage.useEffect.run.pairs"]);
                    const next = {};
                    await Promise.all(pairs.map({
                        "AiPage.useEffect.run": async (p)=>{
                            try {
                                const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(p.url)}&format=json`;
                                const res = await fetch(oembed);
                                if (!res.ok) throw new Error("oembed failed");
                                const json = await res.json();
                                next[p.id] = json.title?.trim() || p.fallback;
                            } catch  {
                                next[p.id] = p.fallback;
                            }
                        }
                    }["AiPage.useEffect.run"]));
                    if (!cancelled) setTitleMap(next);
                }
            }["AiPage.useEffect.run"];
            run();
            return ({
                "AiPage.useEffect": ()=>{
                    cancelled = true;
                }
            })["AiPage.useEffect"];
        }
    }["AiPage.useEffect"], [
        mapped
    ]);
    const goBack = ()=>{
        try {
            sessionStorage.setItem("returnToSelect", "1");
        } catch  {}
        router.push("/?select=1");
    };
    // ESC로 모달 닫기
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AiPage.useEffect": ()=>{
            if (!openId) return;
            const onKey = {
                "AiPage.useEffect.onKey": (e)=>{
                    if (e.key === "Escape") setOpenId(null);
                }
            }["AiPage.useEffect.onKey"];
            window.addEventListener("keydown", onKey);
            return ({
                "AiPage.useEffect": ()=>window.removeEventListener("keydown", onKey)
            })["AiPage.useEffect"];
        }
    }["AiPage.useEffect"], [
        openId
    ]);
    // --- Player state ---
    const playerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const playerHostRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const playerWrapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const modalPanelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [duration, setDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [current, setCurrent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [volume, setVolume] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(80); // 0~100
    const [muted, setMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const stopRaf = ()=>{
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    };
    const startRaf = ()=>{
        stopRaf();
        const tick = ()=>{
            const p = playerRef.current;
            if (p && typeof p.getCurrentTime === "function" && typeof p.getDuration === "function") {
                try {
                    const t = p.getCurrentTime();
                    const d = p.getDuration();
                    if (Number.isFinite(d) && d > 0) setDuration(d);
                    if (Number.isFinite(t) && t >= 0) setCurrent(t);
                } catch  {}
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    };
    // ✅ 모달 열릴 때: YouTube Player를 생성 (controls 숨김) + 커스텀 컨트롤만 제공
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AiPage.useEffect": ()=>{
            let cancelled = false;
            const mount = {
                "AiPage.useEffect.mount": async ()=>{
                    if (!openId) return;
                    await loadYouTubeIframeApi();
                    if (cancelled) return;
                    // 기존 플레이어 제거
                    try {
                        playerRef.current?.destroy?.();
                    } catch  {}
                    playerRef.current = null;
                    stopRaf();
                    setIsPlaying(false);
                    setDuration(0);
                    setCurrent(0);
                    const host = playerHostRef.current;
                    if (!host) return;
                    // 컨테이너 초기화
                    host.innerHTML = "";
                    host.style.position = "relative";
                    host.style.width = "100%";
                    host.style.height = "100%";
                    // Player 생성
                    playerRef.current = new window.YT.Player(host, {
                        videoId: openId,
                        width: "100%",
                        height: "100%",
                        playerVars: {
                            autoplay: 1,
                            controls: 0,
                            rel: 0,
                            modestbranding: 1,
                            playsinline: 1,
                            iv_load_policy: 3,
                            fs: 0,
                            disablekb: 1,
                            // showinfo는 더이상 공식 지원은 아니지만, 일부 환경에서 불필요 UI가 줄어들기도 함
                            showinfo: 0,
                            origin: ("TURBOPACK compile-time truthy", 1) ? window.location.origin : "TURBOPACK unreachable"
                        },
                        events: {
                            onReady: {
                                "AiPage.useEffect.mount": (e)=>{
                                    try {
                                        const d = e?.target?.getDuration?.();
                                        if (Number.isFinite(d) && d > 0) setDuration(d);
                                    } catch  {}
                                    // iframe이 컨테이너를 100% 채우도록 강제
                                    try {
                                        const iframe = host.querySelector("iframe");
                                        if (iframe) {
                                            iframe.style.position = "absolute";
                                            iframe.style.inset = "0";
                                            iframe.style.width = "100%";
                                            iframe.style.height = "100%";
                                            iframe.style.border = "0";
                                            iframe.setAttribute("allowfullscreen", "true");
                                            iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen");
                                        }
                                    } catch  {}
                                    // 초기 볼륨/뮤트 반영
                                    try {
                                        const p = e?.target;
                                        if (muted) p.mute?.();
                                        else p.unMute?.();
                                        p.setVolume?.(volume);
                                    } catch  {}
                                    setIsPlaying(true);
                                    startRaf();
                                }
                            }["AiPage.useEffect.mount"],
                            onStateChange: {
                                "AiPage.useEffect.mount": (e)=>{
                                    const st = e?.data; // 1: playing, 2: paused, 0: ended
                                    if (st === 1) setIsPlaying(true);
                                    if (st === 2 || st === 0) setIsPlaying(false);
                                }
                            }["AiPage.useEffect.mount"]
                        }
                    });
                }
            }["AiPage.useEffect.mount"];
            mount();
            return ({
                "AiPage.useEffect": ()=>{
                    cancelled = true;
                    stopRaf();
                    try {
                        playerRef.current?.destroy?.();
                    } catch  {}
                    playerRef.current = null;
                }
            })["AiPage.useEffect"];
        }
    }["AiPage.useEffect"], [
        openId
    ]);
    // ✅ 볼륨/뮤트 상태를 Player에 동기화 (플레이어 재생성 ❌)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AiPage.useEffect": ()=>{
            const p = playerRef.current;
            if (!p) return;
            try {
                if (muted) p.mute?.();
                else p.unMute?.();
                p.setVolume?.(volume);
            } catch  {}
        }
    }["AiPage.useEffect"], [
        volume,
        muted
    ]);
    // ✅ Fullscreen 상태 감지 (ESC 등으로 종료될 때도 UI 갱신)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AiPage.useEffect": ()=>{
            const onFs = {
                "AiPage.useEffect.onFs": ()=>setIsFullscreen(!!document.fullscreenElement)
            }["AiPage.useEffect.onFs"];
            document.addEventListener("fullscreenchange", onFs);
            return ({
                "AiPage.useEffect": ()=>document.removeEventListener("fullscreenchange", onFs)
            })["AiPage.useEffect"];
        }
    }["AiPage.useEffect"], []);
    const togglePlay = ()=>{
        const p = playerRef.current;
        if (!p) return;
        try {
            if (isPlaying) p.pauseVideo();
            else p.playVideo();
        } catch  {}
    };
    const seekTo = (t)=>{
        const p = playerRef.current;
        if (!p) return;
        try {
            p.seekTo(Math.max(0, Math.min(t, duration || t)), true);
            setCurrent(t);
        } catch  {}
    };
    const toggleMute = ()=>{
        const p = playerRef.current;
        if (!p) return;
        try {
            if (muted) {
                p.unMute?.();
                setMuted(false);
            } else {
                p.mute?.();
                setMuted(true);
            }
        } catch  {}
    };
    const onChangeVolume = (v)=>{
        const vv = Math.max(0, Math.min(100, Math.round(v)));
        setVolume(vv);
        if (vv === 0) setMuted(true);
        else setMuted(false);
        try {
            const p = playerRef.current;
            if (!p) return;
            if (vv === 0) p.mute?.();
            else {
                p.unMute?.();
                p.setVolume?.(vv);
            }
        } catch  {}
    };
    const toggleFullscreen = async ()=>{
        const el = playerWrapRef.current;
        if (!el) return;
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await el.requestFullscreen();
            }
        } catch  {
        // 일부 브라우저/환경에서 실패할 수 있음 (특히 iOS Safari)
        }
    };
    const formatTime = (sec)=>{
        if (!Number.isFinite(sec)) return "0:00";
        const s = Math.max(0, Math.floor(sec));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${String(r).padStart(2, "0")}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "fixed inset-0 bg-black overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-center bg-no-repeat bg-contain",
                style: {
                    backgroundImage: "url(/images/contents_bg.jpg)"
                }
            }, void 0, false, {
                fileName: "[project]/app/ai/page.tsx",
                lineNumber: 430,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 h-full max-w-6xl mx-auto px-6 py-10 text-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs tracking-[0.22em] text-white/70",
                                        children: "CATEGORY"
                                    }, void 0, false, {
                                        fileName: "[project]/app/ai/page.tsx",
                                        lineNumber: 439,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl mt-1",
                                        children: "AI CONTENTS"
                                    }, void 0, false, {
                                        fileName: "[project]/app/ai/page.tsx",
                                        lineNumber: 440,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/ai/page.tsx",
                                lineNumber: 438,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: goBack,
                                className: "cursor-pointer px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md hover:bg-white hover:text-black transition",
                                children: "BACK"
                            }, void 0, false, {
                                fileName: "[project]/app/ai/page.tsx",
                                lineNumber: 443,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/ai/page.tsx",
                        lineNumber: 437,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 h-[calc(100%-5.5rem)] overflow-auto pr-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                                children: mapped.map((it)=>{
                                    const id = it.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setOpenId(id),
                                        className: "cursor-pointer text-left rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md overflow-hidden hover:bg-black/35 transition focus:outline-none",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "aspect-video bg-black/40",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: thumbUrl(id),
                                                    alt: titleMap[id] || it.fallbackTitle || "YouTube Video",
                                                    className: "w-full h-full object-cover",
                                                    draggable: false,
                                                    loading: "lazy"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/ai/page.tsx",
                                                    lineNumber: 463,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/ai/page.tsx",
                                                lineNumber: 462,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm",
                                                    children: titleMap[id] || it.fallbackTitle || "Loading..."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/ai/page.tsx",
                                                    lineNumber: 472,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/ai/page.tsx",
                                                lineNumber: 471,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, id, true, {
                                        fileName: "[project]/app/ai/page.tsx",
                                        lineNumber: 457,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/ai/page.tsx",
                                lineNumber: 453,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-10"
                            }, void 0, false, {
                                fileName: "[project]/app/ai/page.tsx",
                                lineNumber: 479,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/ai/page.tsx",
                        lineNumber: 452,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/ai/page.tsx",
                lineNumber: 435,
                columnNumber: 7
            }, this),
            openId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 bg-black/85 cursor-default",
                onMouseDown: (e)=>{
                    const panel = modalPanelRef.current;
                    if (panel && !panel.contains(e.target)) setOpenId(null);
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full w-full p-4 sm:p-8 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: modalPanelRef,
                        className: "relative w-full max-w-6xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpenId(null),
                                className: "absolute -top-14 right-0 sm:-top-16 cursor-pointer w-11 h-11 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center",
                                "aria-label": "close",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "18",
                                    height: "18",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    "aria-hidden": "true",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M6 6l12 12M18 6L6 18",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/app/ai/page.tsx",
                                        lineNumber: 501,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/ai/page.tsx",
                                    lineNumber: 500,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/ai/page.tsx",
                                lineNumber: 495,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: playerWrapRef,
                                className: "relative w-full aspect-video rounded-2xl overflow-hidden border border-white/12 bg-black shadow-2xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: playerHostRef,
                                        className: "absolute inset-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0"
                                    }, void 0, false, {
                                        fileName: "[project]/app/ai/page.tsx",
                                        lineNumber: 511,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: togglePlay,
                                        className: "absolute inset-0 z-10 w-full h-full cursor-pointer",
                                        "aria-label": "toggle play"
                                    }, void 0, false, {
                                        fileName: "[project]/app/ai/page.tsx",
                                        lineNumber: 517,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pointer-events-none absolute inset-x-0 bottom-0 z-20",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "pointer-events-auto px-4 sm:px-5 py-4 bg-gradient-to-t from-black/70 to-transparent",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: togglePlay,
                                                        className: "cursor-pointer w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center",
                                                        "aria-label": "play pause",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm",
                                                            children: isPlaying ? "❚❚" : "▶"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/ai/page.tsx",
                                                            lineNumber: 533,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/ai/page.tsx",
                                                        lineNumber: 528,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-white/70 tabular-nums w-[3.75rem]",
                                                        children: formatTime(current)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/ai/page.tsx",
                                                        lineNumber: 537,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        className: "flex-1 cursor-pointer accent-white/80",
                                                        type: "range",
                                                        min: 0,
                                                        max: Math.max(1, Math.floor(duration || 1)),
                                                        value: Math.floor(current),
                                                        onChange: (e)=>seekTo(Number(e.target.value)),
                                                        "aria-label": "seek"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/ai/page.tsx",
                                                        lineNumber: 542,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-white/70 tabular-nums w-[3.75rem] text-right",
                                                        children: duration > 0 ? formatTime(duration) : "—:—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/ai/page.tsx",
                                                        lineNumber: 552,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: toggleMute,
                                                        className: "cursor-pointer w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center",
                                                        "aria-label": "mute",
                                                        title: muted || volume === 0 ? "Unmute" : "Mute",
                                                        children: muted || volume === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "18",
                                                            height: "18",
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            "aria-hidden": "true",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M11 5l-4 4H4v6h3l4 4V5z",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                    strokeLinejoin: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/ai/page.tsx",
                                                                    lineNumber: 565,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M16 9l4 4m0-4l-4 4",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                    strokeLinecap: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/ai/page.tsx",
                                                                    lineNumber: 566,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/ai/page.tsx",
                                                            lineNumber: 564,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "18",
                                                            height: "18",
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            "aria-hidden": "true",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M11 5l-4 4H4v6h3l4 4V5z",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                    strokeLinejoin: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/ai/page.tsx",
                                                                    lineNumber: 570,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M16 10c1.5 1.5 1.5 4.5 0 6",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                    strokeLinecap: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/ai/page.tsx",
                                                                    lineNumber: 571,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M18.5 7.5c3 3 3 9 0 12",
                                                                    stroke: "currentColor",
                                                                    strokeWidth: "2",
                                                                    strokeLinecap: "round"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/ai/page.tsx",
                                                                    lineNumber: 572,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/ai/page.tsx",
                                                            lineNumber: 569,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/ai/page.tsx",
                                                        lineNumber: 557,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        className: "w-24 cursor-pointer accent-white/80 hidden sm:block",
                                                        type: "range",
                                                        min: 0,
                                                        max: 100,
                                                        value: muted ? 0 : volume,
                                                        onChange: (e)=>onChangeVolume(Number(e.target.value)),
                                                        "aria-label": "volume"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/ai/page.tsx",
                                                        lineNumber: 577,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: toggleFullscreen,
                                                        className: "cursor-pointer w-10 h-10 rounded-full border border-white/15 bg-black/40 hover:bg-white hover:text-black transition flex items-center justify-center",
                                                        "aria-label": "fullscreen",
                                                        title: isFullscreen ? "Exit Fullscreen" : "Fullscreen",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm",
                                                            children: isFullscreen ? "⤡" : "⛶"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/ai/page.tsx",
                                                            lineNumber: 594,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/ai/page.tsx",
                                                        lineNumber: 588,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/ai/page.tsx",
                                                lineNumber: 526,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/ai/page.tsx",
                                            lineNumber: 525,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/ai/page.tsx",
                                        lineNumber: 524,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/ai/page.tsx",
                                lineNumber: 506,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sm:hidden mt-4 px-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-white/70 w-10",
                                            children: muted || volume === 0 ? "M" : "VOL"
                                        }, void 0, false, {
                                            fileName: "[project]/app/ai/page.tsx",
                                            lineNumber: 604,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "flex-1 cursor-pointer accent-white/80",
                                            type: "range",
                                            min: 0,
                                            max: 100,
                                            value: muted ? 0 : volume,
                                            onChange: (e)=>onChangeVolume(Number(e.target.value)),
                                            "aria-label": "volume mobile"
                                        }, void 0, false, {
                                            fileName: "[project]/app/ai/page.tsx",
                                            lineNumber: 605,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/ai/page.tsx",
                                    lineNumber: 603,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/ai/page.tsx",
                                lineNumber: 602,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/ai/page.tsx",
                        lineNumber: 493,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/ai/page.tsx",
                    lineNumber: 492,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/ai/page.tsx",
                lineNumber: 485,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/ai/page.tsx",
        lineNumber: 428,
        columnNumber: 5
    }, this);
}
_s(AiPage, "i5wAbz2dDs7fMV0Y1MDY7GRwdq4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AiPage;
var _c;
__turbopack_context__.k.register(_c, "AiPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_8b91e8f3._.js.map