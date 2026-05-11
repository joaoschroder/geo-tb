"use client";

import { GeoJSON } from "react-leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import { useMemo } from "react";

type Props = {
    geojson: GeoJsonObject;
    counts: Record<string, number>;
    onMunicipioClick: (name: string, code: string) => void;
};

function normalizeMunicipioCode(code: unknown): string {
    return String(code ?? "").trim().slice(0, 6);
}

function createColorScale(counts: Record<string, number>) {
    const values = Object.values(counts);

    if (values.length === 0) {
        return (_value: number) => "#FFEDA0";
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    return (value: number): string => {
        if (value <= 0) return "#FFEDA0";
        if (max === min) return "#800026";

        const normalized = (value - min) / (max - min);

        if (normalized > 0.85) return "#800026";
        if (normalized > 0.70) return "#BD0026";
        if (normalized > 0.55) return "#E31A1C";
        if (normalized > 0.40) return "#FC4E2A";
        if (normalized > 0.25) return "#FD8D3C";
        if (normalized > 0.10) return "#FEB24C";
        return "#FED976";
    };
}

export default function MunicipiosLayer({ geojson, counts, onMunicipioClick }: Props) {
    const getColor = useMemo(() => createColorScale(counts), [counts]);

    return (
        Object.keys(counts).length !== 0 && <GeoJSON
            data={geojson}
            style={(feature?: Feature) => {
                const code = normalizeMunicipioCode(feature?.properties?.id);
                const total = counts[code] ?? 0;

                return {
                    fillColor: getColor(total),
                    weight: 1,
                    opacity: 1,
                    color: "#626",
                    fillOpacity: 0.7,
                };
            }}
            onEachFeature={(feature, layer) => {
                const code = normalizeMunicipioCode(feature?.properties?.id);
                const name = String(feature.properties?.name ?? "Município");
                const total = counts[code] ?? 0;

                layer.bindTooltip(`<strong>${name}</strong><br/>Notificações: ${total}`, {
                    sticky: true,
                    direction: "top",
                });

                layer.on("click", () => {
                    onMunicipioClick(name, code);
                });
            }}
        />
    );
}