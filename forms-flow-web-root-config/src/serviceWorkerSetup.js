export async function register(config) {
  // Check if service workers are supported by the browser
  if ('serviceWorker' in navigator) {
    const swUrl = '/worker.js'
    try {
      const registration = await navigator.serviceWorker.register(swUrl);

      // Handle service worker registration successful
      console.log('ServiceWorker registration successful:', registration);

      // Check for service worker updates
      if (registration.waiting) {
        // Service worker is waiting to activate, trigger update
        if (config && config.onUpdate) {
          config.onUpdate(registration);
        }
      }

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          // Service worker is installing, track its state changes
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              // Service worker is installed and waiting to activate, trigger update
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            }
          });
        }
      });
    } catch (error) {
      // Handle service worker registration error
      console.log('ServiceWorker registration failed:', error);
    }
  }
}

export async function unregister() {
  // Check if service workers are supported by the browser
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();

      // Handle service worker unregistration successful
      console.log('ServiceWorker unregistration successful:', registration);
    } catch (error) {
      // Handle service worker unregistration error
      console.log('ServiceWorker unregistration failed:', error);
    }
  }
}
