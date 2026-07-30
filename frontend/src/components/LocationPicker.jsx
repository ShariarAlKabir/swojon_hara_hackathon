import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { getLiveLocation } from "../utils/location";

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  if (!position) return null;

  return <Marker position={position} />;
}

export default function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const mapRef = useRef(null);

  function selectLocation(location) {
    const latlng = { lat: location.lat, lng: location.lng };
    setPosition(latlng);
    onLocationSelect(latlng);
  }

  async function handleUseCurrentLocation() {
    try {
      setLocating(true);
      setLocationError("");
      const location = await getLiveLocation();
      const latlng = { lat: location.latitude, lng: location.longitude };
      selectLocation(latlng);
      mapRef.current?.flyTo([latlng.lat, latlng.lng], 17, { duration: 1.1 });
    } catch (err) {
      setLocationError(err.message || "Your current location could not be found.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <>
      <MapContainer
        ref={mapRef}
        center={[23.8103, 90.4125]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          setPosition={selectLocation}
        />
      </MapContainer>

      <button
        type="button"
        className="map-location-button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        aria-label="Use and show my current location"
      >
        <span aria-hidden="true">⌖</span>
        {locating ? "Locating…" : "My location"}
      </button>

      {locationError && (
        <div className="map-location-error" role="alert">{locationError}</div>
      )}

      {position && (
        <div className="selected-location-details">
          <strong>Selected Location</strong>

          <p>Latitude: {position.lat}</p>

          <p>Longitude: {position.lng}</p>
        </div>
      )}
    </>
  );
}
