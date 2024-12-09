let isScriptLoading = false;
let isScriptLoaded = false;
const GOOGLE_MAPS_API_KEY = 'AIzaSyDHVHjHcYn7EVBzWk_LJ2yQEcrbBVb7k';

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isScriptLoaded) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      const checkLoaded = setInterval(() => {
        if (isScriptLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }

    isScriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
    };

    script.onerror = (error) => {
      isScriptLoading = false;
      reject(error);
    };

    document.head.appendChild(script);
  });
};