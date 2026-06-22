'use client';
import { useState, useCallback } from 'react';
import { useLocale } from '@/hooks/useLocale';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  province: string;
}

interface AddressMapProps {
  onLocationSelect: (data: LocationData) => void;
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function AddressMap({ onLocationSelect }: AddressMapProps) {
  const { locale } = useLocale();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoading(true);
    setSelectedAddress('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'Z7shop/1.0' } }
      );
      const data = await res.json();

      const addr = data.address || {};
      const fullAddress = data.display_name || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const province = addr.state || addr.province || '';

      setSelectedAddress(fullAddress);
      onLocationSelect({ lat, lng, address: fullAddress, city, province });
    } catch {
      setSelectedAddress(locale === 'fa' ? 'خطا در دریافت آدرس' : 'Error fetching address');
    } finally {
      setLoading(false);
    }
  }, [locale, onLocationSelect]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">
        {locale === 'fa' ? 'روی نقشه کلیک کنید تا آدرس تعیین شود' : 'Click on the map to set your address'}
      </p>
      <div className="rounded-xl overflow-hidden border border-gray-700" style={{ height: 300 }}>
        <MapContainer
          center={[35.6892, 51.3890]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onSelect={handleMapClick} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {loading && (
        <p className="text-xs text-gold animate-pulse">
          {locale === 'fa' ? 'در حال دریافت آدرس...' : 'Fetching address...'}
        </p>
      )}
      {selectedAddress && !loading && (
        <p className="text-xs text-green-400">
          ✓ {selectedAddress}
        </p>
      )}
    </div>
  );
}
