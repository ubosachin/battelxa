"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until verified
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already running as standalone app (installed)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone ===
          true);

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Check dismissal status in session
    const dismissed = sessionStorage.getItem("battlexa_pwa_dismissed");
    if (!dismissed) {
      setIsDismissed(false);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Listen for Chrome/Android install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("battlexa_pwa_dismissed", "true");
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  // Only render banner if Android prompt is ready or user is on iOS mobile browser
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="md:hidden fixed top-16 inset-x-2 z-40 animate-in slide-in-from-top-4 duration-300">
        <div className="glass-panel bg-[#0d101c]/95 border border-lime-500/30 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-lime-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Smartphone className="w-5 h-5 text-black" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                BATTLEXA Mobile App
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-lime-400/20 text-lime-400 border border-lime-400/30 font-semibold">
                  FAST
                </span>
              </h4>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                Install on your phone for instant room alerts & 1-tap join
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="primary"
              className="py-1 px-3 text-xs bg-lime-500 hover:bg-lime-400 text-black font-bold h-8"
              onClick={handleInstallClick}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Install
            </Button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Drawer Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-lime-500 flex items-center justify-center mx-auto mb-3 text-black">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Add BATTLEXA to your iOS Home Screen for full fullscreen gaming experience.
              </p>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 mb-6 bg-white/[0.03] p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <span>
                  Tap the <strong className="text-white">Share</strong> button{" "}
                  <Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> in Safari's bottom toolbar.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <span>
                  Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <span>
                  Tap <strong className="text-lime-400 font-bold">Add</strong> at the top right. Enjoy!
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold"
              onClick={() => {
                setShowIOSGuide(false);
                handleDismiss();
              }}
            >
              Got It
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
