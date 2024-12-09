import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface AddressMapProps {
  address: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export function AddressMap({ address, coordinates }: AddressMapProps) {
  useEffect(() => {
    // Force a resize event after the map is loaded
    // This fixes the partial grey map issue
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }, []);

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        center={[coordinates.lat, coordinates.lon]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lon]}>
          <Popup>
            <div className="text-sm">
              <strong>Address:</strong><br />
              {address}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}