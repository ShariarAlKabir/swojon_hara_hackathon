import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

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

  return (
    <>
      <MapContainer
        center={[23.8103, 90.4125]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          setPosition={(latlng) => {
            setPosition(latlng);
            onLocationSelect(latlng);
          }}
        />
      </MapContainer>

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
