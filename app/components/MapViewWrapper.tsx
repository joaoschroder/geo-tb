"use client";

import dynamic from "next/dynamic";

type Props = {
    counts: Record<string, number>;
    onMunicipioClick: (name: string, code: string) => void;
}

const MapView = dynamic(() => import("./MapView"), {
    ssr: false,
});

export default function MapWrapper({ counts, onMunicipioClick }: Props) {
    return <MapView counts={counts} onMunicipioClick={onMunicipioClick} />;
}