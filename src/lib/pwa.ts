// ABOUTME: Registers the app service worker when running a production browser build.
// ABOUTME: Keeps registration logic isolated and testable for predictable PWA behavior.
interface ServiceWorkerLike {
  register: (scriptUrl: string) => Promise<unknown>
}

interface NavigatorLike {
  serviceWorker?: ServiceWorkerLike
}

interface RegisterOptions {
  isProduction?: boolean
  navigatorLike?: NavigatorLike
}

export async function registerAppServiceWorker(
  options: RegisterOptions = {},
): Promise<void> {
  const isProduction = options.isProduction ?? import.meta.env.PROD
  if (!isProduction) {
    return
  }

  const navigatorLike = options.navigatorLike ?? getNavigatorLike()
  if (!navigatorLike.serviceWorker) {
    return
  }

  await navigatorLike.serviceWorker.register('/sw.js')
}

function getNavigatorLike(): NavigatorLike {
  if (typeof navigator === 'undefined') {
    return {}
  }

  return navigator as unknown as NavigatorLike
}
