"use client";

import { useEffect } from "react";

export function DevToolsBlocker() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_INSPECT_ALLOWED === "true") return;

    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    let devtoolsOpen = false;
    const threshold = 160;

    const detectDevTools = () => {
      const widthThreshold =
        window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
        }
      } else {
        devtoolsOpen = false;
      }
    };

    const detectDebugger = () => {
      const date = new Date();
      // eslint-disable-next-line no-debugger
      debugger;
      if (new Date() - date.getTime() > 100) {
        document.body.innerHTML = "";
        document.write("<h1 style='text-align:center;margin-top:40vh'>Access Denied</h1>");
      }
    };

    document.addEventListener("keydown", blockKeys, true);
    document.addEventListener("contextmenu", blockContextMenu, true);
    window.addEventListener("resize", detectDevTools);

    const debuggerInterval = setInterval(detectDebugger, 1000);
    const devtoolsInterval = setInterval(detectDevTools, 500);

    return () => {
      document.removeEventListener("keydown", blockKeys, true);
      document.removeEventListener("contextmenu", blockContextMenu, true);
      window.removeEventListener("resize", detectDevTools);
      clearInterval(debuggerInterval);
      clearInterval(devtoolsInterval);
    };
  }, []);

  return null;
}
