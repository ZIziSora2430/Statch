import React, { useState, useEffect, useMemo, useRef} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- TỰ ĐỘNG DI CHUYỂN CAMERA ---
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    // map.setView([lat, lng]); // Dùng cái này nếu muốn nhảy bụp cái tới luôn
    map.flyTo([lat, lng], map.getZoom()); // Dùng cái này để "bay" mượt mà tới vị trí mới
  }, [lat, lng]);
  return null;
}

// Component con: Xử lí sự kiện Click trên bản đồ
function MapClickHandler({ setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng); // Cập nhật vị trí ghim trên UI
      onLocationSelect(lat, lng); // Gửi tọa độ về form cha
    },
  });
  return null; // Component này không vẽ gì cả, chỉ xử lý logic click
}


// Component con: Xử lí sự kiện Click/Kéo
function DraggableMarker({ position, setPosition, onLocationSelect }) {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);

                    // Gửi tạo độ về cho Form cha
                    onLocationSelect(newPos.lat, newPos.lng);
                }
            },
        }),
        [setPosition, onLocationSelect]
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}>
            <Popup minWidth={90}>
                <span>Kéo thả để chỉnh vị trí</span>
            </Popup>
        </Marker>
    );
}

// Component chính: Bản đồ chọn vị trí
export default function LocationPicker({ defaultLat = 10.762622, defaultLng = 106.660172, onLocationSelect }) {
    const [position, setPosition] = useState({ 
        lat: defaultLat || 10.7769, 
        lng: defaultLng || 106.7009
    });
    // Cập nhật lại vị trí khi pros thay đổi
    useEffect(() => {
        if (defaultLat && defaultLng) {
            setPosition({ lat: defaultLat, lng: defaultLng });
        }
    }, [defaultLat, defaultLng]);

    return (
        <div style={{ height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid #ccc", marginTop: "10px" }}>
      <MapContainer center={[position.lat, position.lng]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically lat={position.lat} lng={position.lng} />
        <MapClickHandler setPosition={setPosition} onLocationSelect={onLocationSelect} />
        <DraggableMarker 
            position={position} 
            setPosition={setPosition} 
            onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
      <div style={{ textAlign: "center", fontSize: "12px", color: "#666", marginTop: "5px" }}>
          Đang chọn: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
      </div>
    </div>
  );
}