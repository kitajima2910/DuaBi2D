/**
 * PWA Setup — Register service worker + install prompt handler
 */

export function registerSW(): void {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker không được hỗ trợ");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      console.log("✅ SW registered:", reg.scope);
    } catch (err) {
      console.warn("⚠ SW registration failed:", err);
    }
  });
}

/**
 * PWA BeforeInstallPromptEvent — not in standard TS lib.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function setupInstallPrompt(): void {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;

    const btn = document.getElementById("install-btn") || createInstallButton();
    btn.style.display = "flex";

    btn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      console.log("📦 Install result:", result.outcome);
      deferredPrompt = null;
      btn.style.display = "none";
    });
  });

  window.addEventListener("appinstalled", () => {
    console.log("✅ App installed successfully");
    const btn = document.getElementById("install-btn");
    if (btn) btn.style.display = "none";
    deferredPrompt = null;
  });
}

function createInstallButton(): HTMLElement {
  const existing = document.getElementById("install-btn");
  if (existing) return existing;

  const btn = document.createElement("button");
  btn.id = "install-btn";
  btn.textContent = "📲 Cài đặt game";
  btn.style.cssText = [
    'position: fixed; bottom: 24px; right: 24px; z-index: 9999;',
    'padding: 12px 24px; background: linear-gradient(135deg, #3b82f6, #8b5cf6);',
    'color: #fff; border: none; border-radius: 12px;',
    "font: 600 15px 'Segoe UI', system-ui, sans-serif; cursor: pointer;",
    'box-shadow: 0 4px 16px rgba(59,130,246,0.4); display: none;',
    'align-items: center; gap: 8px;',
    'transition: transform 0.2s;',
  ].join(' ');
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.05)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = "scale(1)"; });
  document.body.appendChild(btn);
  return btn;
}
