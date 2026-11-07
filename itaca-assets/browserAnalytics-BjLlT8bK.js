const noop = () => {};

export function createBrowserAnalytics() {
  const host = globalThis.location?.hostname;
  if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
    throw new Error('Browser analytics is not configured for this deployment.');
  }

  // Local demo mode must not send clinical workflow telemetry off this device.
  return {
    initializeGA: noop,
    initializeAmplitude: noop,
    sendCompleteRegistration: noop,
    sendPageView: noop,
    sendEvent: noop,
    resetIdentity: noop,
    syncIdentity: noop,
    flushQueuedCompleteRegistration: noop
  };
}
