/**
 * Monkey-patches HTMLIFrameElement to ensure that every iframe—especially
 * those generated dynamically by YouTube's www-widgetapi.js—always includes
 * 'fullscreen' in its 'allow' permissions policy and 'allowfullscreen'.
 *
 * Why this is necessary:
 * YouTube's own www-widgetapi.js sets:
 *   iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
 * YouTube's API script omits "fullscreen" from its allow string.
 * In modern Chromium and Brave browsers, the 'allow' attribute takes precedence
 * over the legacy 'allowfullscreen' attribute. Because "fullscreen" was omitted
 * by YouTube's script, the browser blocks the iframe from requesting fullscreen,
 * which disables or breaks YouTube's in-built fullscreen button.
 *
 * By intercepting setAttribute and property assignments on HTMLIFrameElement,
 * we ensure "fullscreen" is present before the iframe loads, fully enabling
 * the in-built YouTube fullscreen button.
 */
export function setupIframeFullscreenSupport() {
  if (typeof window === 'undefined' || typeof HTMLIFrameElement === 'undefined') {
    return;
  }

  // Prevent multiple patch applications
  if ((window as any).__iframe_fullscreen_patched__) {
    return;
  }
  (window as any).__iframe_fullscreen_patched__ = true;

  const originalSetAttribute = HTMLIFrameElement.prototype.setAttribute;

  HTMLIFrameElement.prototype.setAttribute = function (name: string, value: string) {
    if (name.toLowerCase() === 'allow' && typeof value === 'string') {
      if (!value.includes('fullscreen')) {
        value = value.trim() ? `${value}; fullscreen` : 'fullscreen';
      }
    }
    return originalSetAttribute.call(this, name, value);
  };
}

// Auto-run on import
setupIframeFullscreenSupport();
