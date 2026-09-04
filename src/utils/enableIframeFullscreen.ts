/**
 * Ensures that every iframe—especially those generated dynamically by YouTube's www-widgetapi.js—always
 * has the 'fullscreen' permission policy in its 'allow' attribute and 'allowfullscreen' enabled.
 *
 * Why this is necessary:
 * YouTube's own www-widgetapi.js sets:
 *   b.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
 * Notice YouTube omits "fullscreen" from its allow attribute.
 * In modern Chromium and Brave browsers, when an 'allow' attribute is present, it takes precedence
 * over the legacy 'allowfullscreen' attribute. Because "fullscreen" was omitted by YouTube's script,
 * the browser blocks the iframe from requesting fullscreen, which disables the on-video fullscreen/expand button.
 *
 * In DOM specifications, setAttribute is defined on Element.prototype (not HTMLIFrameElement).
 * By intercepting Element.prototype.setAttribute and using a MutationObserver, we guarantee
 * that "fullscreen" is always attached to every iframe before and during navigation.
 */
export function setupIframeFullscreenSupport() {
  if (typeof window === 'undefined' || typeof Element === 'undefined') {
    return;
  }

  // Prevent multiple patch applications
  if ((window as any).__iframe_fullscreen_patched__) {
    return;
  }
  (window as any).__iframe_fullscreen_patched__ = true;

  // 1. Patch Element.prototype.setAttribute (where setAttribute actually lives in DOM)
  const origElementSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    if (name && typeof name === 'string' && name.toLowerCase() === 'allow' && typeof value === 'string') {
      const isIframe = this instanceof HTMLIFrameElement || (this.tagName && this.tagName.toLowerCase() === 'iframe');
      if (isIframe && !value.includes('fullscreen')) {
        value = value.trim() ? `${value}; fullscreen` : 'fullscreen';
      }
    }
    return origElementSetAttribute.call(this, name, value);
  };

  // 2. Also patch HTMLIFrameElement.prototype.setAttribute if separate
  if (typeof HTMLIFrameElement !== 'undefined') {
    const origIframeSetAttribute = HTMLIFrameElement.prototype.setAttribute;
    if (origIframeSetAttribute && origIframeSetAttribute !== origElementSetAttribute) {
      HTMLIFrameElement.prototype.setAttribute = function (name: string, value: string) {
        if (name && typeof name === 'string' && name.toLowerCase() === 'allow' && typeof value === 'string') {
          if (!value.includes('fullscreen')) {
            value = value.trim() ? `${value}; fullscreen` : 'fullscreen';
          }
        }
        return origIframeSetAttribute.call(this, name, value);
      };
    }
  }

  // 3. MutationObserver as active guard to ensure any dynamically inserted iframe has allow="... fullscreen" and allowfullscreen
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (let i = 0; i < m.addedNodes.length; i++) {
          const node = m.addedNodes[i];
          if (node instanceof HTMLIFrameElement || (node && (node as any).tagName === 'IFRAME')) {
            const iframe = node as HTMLIFrameElement;
            const currentAllow = iframe.getAttribute('allow') || '';
            if (!currentAllow.includes('fullscreen')) {
              origElementSetAttribute.call(iframe, 'allow', currentAllow ? `${currentAllow}; fullscreen` : 'fullscreen');
            }
            if (!iframe.hasAttribute('allowfullscreen')) {
              origElementSetAttribute.call(iframe, 'allowfullscreen', '');
            }
            if (!iframe.hasAttribute('webkitallowfullscreen')) {
              origElementSetAttribute.call(iframe, 'webkitallowfullscreen', '');
            }
            if (!iframe.hasAttribute('mozallowfullscreen')) {
              origElementSetAttribute.call(iframe, 'mozallowfullscreen', '');
            }
          }
        }
      }
    });

    const attachObserver = () => {
      if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachObserver);
    } else {
      attachObserver();
    }
  }
}

// Auto-run on import
setupIframeFullscreenSupport();
