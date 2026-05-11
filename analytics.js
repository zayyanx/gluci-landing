// ===== Gluci Landing Page — analytics.js =====

(function () {
  const analyticsDebug = new URLSearchParams(window.location.search).has('analytics_debug');

  function debugLog(message, details) {
    if (!analyticsDebug) return;
    console.info(`[analytics] ${message}`, details || '');
  }

  function track(eventName, eventParams = {}) {
    if (typeof window.gtag !== 'function') {
      debugLog('Skipped event because the Google tag is not available.', {
        eventName,
        eventParams,
      });
      return;
    }

    window.gtag('event', eventName, {
      app_name: 'gluci_landing',
      ...eventParams,
    });
  }

  window.gluciTrack = track;
  window.gluciAnalytics = {
    measurementId: 'G-8R05LM0ZHG',
    track,
  };
})();
