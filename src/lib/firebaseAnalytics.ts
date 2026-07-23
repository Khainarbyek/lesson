import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { initializeAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";

type AnalyticsWindow = Window & {
  __uyrenFirebaseAnalytics?: {
    instancePromise?: Promise<Analytics | null>;
    trackedPageKeys?: Set<string>;
    hasPageLoadListener?: boolean;
  };
};

function configuredValue(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();

  return trimmedValue || undefined;
}

function getFirebaseConfig(): FirebaseOptions | null {
  const config = {
    apiKey: configuredValue(import.meta.env.PUBLIC_FIREBASE_API_KEY),
    authDomain: configuredValue(import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: configuredValue(import.meta.env.PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: configuredValue(import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: configuredValue(import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: configuredValue(import.meta.env.PUBLIC_FIREBASE_APP_ID),
    measurementId: configuredValue(import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID)
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId || !config.measurementId) {
    return null;
  }

  return config;
}

async function getAnalyticsInstance(): Promise<Analytics | null> {
  const config = getFirebaseConfig();

  if (!config || typeof window === "undefined") {
    return null;
  }

  try {
    const analyticsIsSupported = await isSupported();

    if (!analyticsIsSupported) {
      return null;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(config);

    return initializeAnalytics(app, {
      config: {
        send_page_view: false
      }
    });
  } catch {
    return null;
  }
}

function pageViewKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function trackPageView(analytics: Analytics) {
  const globalState = getGlobalState();
  const currentPageKey = pageViewKey();

  if (globalState.trackedPageKeys?.has(currentPageKey)) {
    return;
  }

  globalState.trackedPageKeys?.add(currentPageKey);
  logEvent(analytics, "page_view", {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title
  });
}

function getGlobalState() {
  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.__uyrenFirebaseAnalytics ??= {
    trackedPageKeys: new Set<string>()
  };
  analyticsWindow.__uyrenFirebaseAnalytics.trackedPageKeys ??= new Set<string>();

  return analyticsWindow.__uyrenFirebaseAnalytics;
}

export function initializeFirebaseAnalytics() {
  if (typeof window === "undefined") {
    return;
  }

  const globalState = getGlobalState();
  globalState.instancePromise ??= getAnalyticsInstance();
  void globalState.instancePromise.then((analytics) => {
    if (!analytics) {
      return;
    }

    trackPageView(analytics);

    if (!globalState.hasPageLoadListener) {
      document.addEventListener("astro:page-load", () => trackPageView(analytics));
      globalState.hasPageLoadListener = true;
    }
  });
}
