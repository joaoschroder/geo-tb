"use client"

import Image from "next/image";
import { useState } from "react";
import { Data, SinanTuberculoseRecord } from "../utils/enum";
import LoadMapData from "./LoadMapData";
import MapViewWrapper from "./MapViewWrapper";
import SidePanel from "./SidePanel";

function normalizeMunicipioCode(code: string | undefined | null): string {
    return String(code ?? "").trim().slice(0, 6);
}

function groupByMunicipio(rows: SinanTuberculoseRecord[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const row of rows) {
        const code = normalizeMunicipioCode(row.ID_MUNICIP);
        if (!code) continue;
        counts[code] = (counts[code] ?? 0) + 1;
    }
    return counts;
}

function groupNotificationsByMunicipio(rows: SinanTuberculoseRecord[]): Record<string, SinanTuberculoseRecord[]> {
    const grouped: Record<string, SinanTuberculoseRecord[]> = {};
    for (const row of rows) {
        const code = normalizeMunicipioCode(row.ID_MUNICIP);
        if (!code) continue;
        if (!grouped[code]) grouped[code] = [];
        grouped[code].push(row);
    }
    return grouped;
}

export default function HomeClient() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [notificationsByCode, setNotificationsByCode] = useState<Record<string, SinanTuberculoseRecord[]>>({});
    const [selectedMunicipio, setSelectedMunicipio] = useState<{ name: string; code: string } | null>(null);

    function onDataLoaded(data: Data) {
        const notifications = data?.notifications ?? [];
        setCounts(groupByMunicipio(notifications));
        setNotificationsByCode(groupNotificationsByMunicipio(notifications));
    }

    function handleMunicipioClick(name: string, code: string) {
        setSelectedMunicipio({ name, code });
    }

    const selectedNotifications = selectedMunicipio
        ? (notificationsByCode[selectedMunicipio.code] ?? [])
        : [];

    return (
        <div className="flex flex-col gap-3" style={{ marginTop: 25, marginLeft: 25 }}>
            <div className="flex items-center gap-4" style={{ marginBottom: 25 }}>
                {/* Título do sistema */}
                <Image
                    src="/geo-tb-logo-transparent.png"
                    alt="GeoTB logo"
                    width={150}
                    height={50}
                    loading="lazy"
                    style={{ background: 'transparent' }}
                />
                <LoadMapData onDataLoaded={onDataLoaded} />
            </div>
            <div className="flex gap-3 items-start">
                <div className="flex-1 min-w-0">
                    <MapViewWrapper counts={counts} onMunicipioClick={handleMunicipioClick} />
                </div>
                <SidePanel
                    municipioName={selectedMunicipio?.name ?? null}
                    municipioCode={selectedMunicipio?.code ?? null}
                    notifications={selectedNotifications}
                />
            </div>
        </div>
    );
}
