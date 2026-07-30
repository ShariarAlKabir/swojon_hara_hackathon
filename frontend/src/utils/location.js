const GEOLOCATION_ERRORS = {
  1: "Location access was denied. Allow location access in your browser and try again.",
  2: "Your location could not be determined. Check your device location settings.",
  3: "Getting your location took too long. Move to an open area and try again.",
};

export function getLiveLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("This browser does not support live location."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (error) => {
        reject(new Error(GEOLOCATION_ERRORS[error.code] || "Unable to access your live location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}
