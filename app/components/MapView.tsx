"use client";
import L from "leaflet";
import { useMemo } from "react";
import { MapContainer, TileLayer } from 'react-leaflet';
import MunicipiosLayer from "./MunicipiosLayer";
import municipiosGeoJson from "../data/geojsondata.json";
import type { GeoJsonObject } from "geojson";

type Props = {
    counts: Record<string, number>;
    onMunicipioClick: (name: string, code: string) => void;
}

const DefaultIcon = L.icon({
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ counts, onMunicipioClick }: Props) {
    const center = useMemo<[number, number]>(() => [-30.03, -51.23], []);

    const layerKey = Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("|");

    return (
        <div style={{ height: "100%", width: "100%", borderRadius: 16, overflow: "hidden" }}>
            <MapContainer
                center={center}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MunicipiosLayer
                    key={layerKey}
                    geojson={municipiosGeoJson as GeoJsonObject}
                    counts={counts}
                    onMunicipioClick={onMunicipioClick}
                />
            </MapContainer>
        </div>
    );
}