import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ reports }) {
  return (
    <div className="map-shell card">
      <MapContainer center={[23.8103, 90.4125]} zoom={12}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {reports.map((report) => (
          <Marker key={report.id} position={[report.latitude, report.longitude]}>
            <Popup>
              <strong>{report.category}</strong>
              <br />
              {report.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
