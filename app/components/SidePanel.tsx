"use client";

import { useState, useEffect } from "react";
import { SinanTuberculoseRecord } from "../utils/enum";

type PredictionResult = {
    favorable: boolean;
    probability: number;
    risk_level?: "LOW" | "MEDIUM" | "HIGH";
    features_used: number;
    error?: string;
};

type Props = {
    municipioName: string | null;
    municipioCode: string | null;
    notifications: SinanTuberculoseRecord[];
};

const SEXO: Record<string, string> = { M: "Masculino", F: "Feminino", I: "Ignorado" };
const SIM_NAO: Record<string, string> = { "1": "Sim", "2": "Não", "9": "Ignorado" };
const FORMA: Record<string, string> = {
    "1": "Pulmonar",
    "2": "Extrapulmonar",
    "3": "Pulmonar + Extrapulmonar",
};
const HIV_MAP: Record<string, string> = {
    "1": "Positivo",
    "2": "Negativo",
    "3": "Em andamento",
    "9": "Ignorado",
};
const RACA: Record<string, string> = {
    "1": "Branca",
    "2": "Preta",
    "3": "Amarela",
    "4": "Parda",
    "5": "Indígena",
    "9": "Ignorado",
};
const ESCOL: Record<string, string> = {
    "0": "Não se aplica",
    "1": "Analfabeto",
    "2": "1ª a 4ª série incompleto",
    "3": "4ª série completo",
    "4": "5ª a 8ª série incompleto",
    "5": "Ensino fundamental completo",
    "6": "Ensino médio incompleto",
    "7": "Ensino médio completo",
    "8": "Superior incompleto",
    "9": "Superior completo",
    "10": "Ignorado",
};
const GESTANT: Record<string, string> = {
    "1": "1º Trimestre",
    "2": "2º Trimestre",
    "3": "3º Trimestre",
    "4": "Ig. gestacional ignorada",
    "5": "Não gestante",
    "6": "Não se aplica",
    "9": "Ignorado",
};
const BACILOSC: Record<string, string> = {
    "1": "Positivo",
    "2": "Negativo",
    "3": "Em andamento",
    "4": "Não realizado",
    "5": "Aguardando resultado",
};
const RAIOX: Record<string, string> = {
    "1": "Normal",
    "2": "Suspeito",
    "3": "Outra patologia",
    "9": "Não realizado",
};
const TESTE_TUBE_MAP: Record<string, string> = {
    "1": "Positivo",
    "2": "Negativo",
    "3": "Não realizado",
    "9": "Ignorado",
};
const TRATAMENTO_MAP: Record<string, string> = {
    "1": "Caso novo",
    "2": "Recidiva",
    "3": "Reingresso pós abandono",
    "4": "Não sabe",
    "5": "Transferência",
    "6": "Pós-óbito",
};

function decodeField(field: keyof SinanTuberculoseRecord, value: string | number | null | undefined): string {
    if (value === null || value === undefined || String(value).trim() === "") return "—";
    const str = String(value).trim();

    switch (field) {
        case "CS_SEXO": return SEXO[str] ?? str;
        case "FORMA": return FORMA[str] ?? str;
        case "HIV": return HIV_MAP[str] ?? str;
        case "CS_RACA": return RACA[str] ?? str;
        case "CS_ESCOL_N": return ESCOL[str] ?? str;
        case "CS_GESTANT": return GESTANT[str] ?? str;
        case "BACILOSC_E":
        case "BACILOSC_O":
        case "BACILOS_E2":
        case "CULTURA_ES":
        case "CULTURA_OU":
        case "HISTOPATOL": return BACILOSC[str] ?? str;
        case "RAIOX_TORA": return RAIOX[str] ?? str;
        case "TESTE_TUBE": return TESTE_TUBE_MAP[str] ?? str;
        case "TRATAMENTO": return TRATAMENTO_MAP[str] ?? str;
        case "AGRAVAIDS":
        case "AGRAVALCOO":
        case "AGRAVDIABE":
        case "AGRAVDROGA":
        case "AGRAVTABAC":
        case "AGRAVDOENC":
        case "AGRAVOUTRA":
        case "TRAT_SUPER":
        case "POP_LIBER":
        case "POP_RUA":
        case "POP_SAUDE":
        case "POP_IMIG":
        case "BENEF_GOV": return SIM_NAO[str] ?? str;
        default: return str;
    }
}

function formatDate(value: string | null | undefined): string {
    if (!value) return "—";
    try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString("pt-BR");
        }
    } catch { }
    return value;
}

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
            <span className="text-xs text-gray-500 shrink-0">{label}</span>
            <span className="text-xs font-medium text-right text-gray-800">{value}</span>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{title}</h4>
            <div className="bg-gray-50 rounded-lg px-3 py-1.5">{children}</div>
        </div>
    );
}

export default function SidePanel({ municipioName, municipioCode, notifications }: Props) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [predicting, setPredicting] = useState(false);

    useEffect(() => {
        setSelectedIndex(null);
        setPrediction(null);
    }, [municipioCode]);

    useEffect(() => {
        if (selectedIndex === null) return;
        const notification = notifications[selectedIndex];
        if (!notification) return;

        setPredicting(true);
        setPrediction(null);

        fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification)
        })
            .then((r) => r.json())
            .then((data) => setPrediction(data))
            .catch((error) => setPrediction(error))
            .finally(() => setPredicting(false));
    }, [selectedIndex, notifications]);

    const selected = selectedIndex !== null ? notifications[selectedIndex] : null;

    return (
        <aside
            style={{ width: 400, minWidth: 400, height: 670, marginRight: 25, padding: 20 }}
            className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-2">
                {municipioName ? (
                    <>
                        <h2 className="text-lg font-bold text-gray-900 truncate">{municipioName}</h2>
                        <p className="text-sm text-gray-500">
                            {notifications.length}{" "}
                            {notifications.length === 1 ? "notificação" : "notificações"}
                        </p>
                    </>
                ) : (
                    <h2 className="text-lg font-semibold text-gray-400">Painel de Notificações</h2>
                )}
            </div>

            {!municipioName ? (
                <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-3">
                    <svg
                        className="text-gray-300"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-sm text-gray-400">
                        Clique em um município no mapa para visualizar as notificações de tuberculose.
                    </p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-2">
                    <p className="text-sm text-gray-400">Nenhuma notificação encontrada para este município.</p>
                </div>
            ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Notification selector */}
                    <select
                        style={{ marginTop: 15, border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
                        value={selectedIndex ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSelectedIndex(v === "" ? null : Number(v));
                        }}
                    >
                        <option value="">Selecione uma notificação...</option>
                        {notifications.map((n, i) => (
                            <option key={i} value={i}>
                                Notificação #{i + 1} — {formatDate(n.DT_NOTIFIC)}
                            </option>
                        ))}
                    </select>

                    {selected ? (
                        <div className="flex-1 overflow-y-auto" style={{ marginTop: 15 }}>
                            <Section title="Identificação">
                                <FieldRow label="Data de Notificação" value={formatDate(selected.DT_NOTIFIC)} />
                                <FieldRow label="Data do Diagnóstico" value={formatDate(selected.DT_DIAG)} />
                                <FieldRow label="Forma da TB" value={decodeField("FORMA", selected.FORMA)} />
                                <FieldRow label="Tipo de Tratamento" value={decodeField("TRATAMENTO", selected.TRATAMENTO)} />
                            </Section>

                            <div style={{ marginTop: 3 }}>
                                <Section title="Paciente">
                                    <FieldRow label="Sexo" value={decodeField("CS_SEXO", selected.CS_SEXO)} />
                                    <FieldRow label="Ano de Nascimento" value={selected.ANO_NASC ?? "—"} />
                                    <FieldRow label="Raça/Cor" value={decodeField("CS_RACA", selected.CS_RACA)} />
                                    <FieldRow label="Escolaridade" value={decodeField("CS_ESCOL_N", selected.CS_ESCOL_N)} />
                                    <FieldRow label="Gestante" value={decodeField("CS_GESTANT", selected.CS_GESTANT)} />
                                </Section>
                            </div>

                            <div style={{ marginTop: 3 }}>
                                <Section title="Diagnóstico Clínico">
                                    <FieldRow label="HIV" value={decodeField("HIV", selected.HIV)} />
                                    <FieldRow label="Raio-X de Tórax" value={decodeField("RAIOX_TORA", selected.RAIOX_TORA)} />
                                    <FieldRow label="Teste Tuberculínico" value={decodeField("TESTE_TUBE", selected.TESTE_TUBE)} />
                                    <FieldRow label="Baciloscopia Escarro" value={decodeField("BACILOSC_E", selected.BACILOSC_E)} />
                                    <FieldRow label="Cultura Escarro" value={decodeField("CULTURA_ES", selected.CULTURA_ES)} />
                                    <FieldRow label="Histopatologia" value={decodeField("HISTOPATOL", selected.HISTOPATOL)} />
                                </Section>
                            </div>
                            <div style={{ marginTop: 3 }}>
                                <Section title="Comorbidades">
                                    <FieldRow label="AIDS" value={decodeField("AGRAVAIDS", selected.AGRAVAIDS)} />
                                    <FieldRow label="Alcoolismo" value={decodeField("AGRAVALCOO", selected.AGRAVALCOO)} />
                                    <FieldRow label="Diabetes" value={decodeField("AGRAVDIABE", selected.AGRAVDIABE)} />
                                    <FieldRow label="Uso de Drogas" value={decodeField("AGRAVDROGA", selected.AGRAVDROGA)} />
                                    <FieldRow label="Tabagismo" value={decodeField("AGRAVTABAC", selected.AGRAVTABAC)} />
                                    <FieldRow label="Outras Doenças" value={decodeField("AGRAVDOENC", selected.AGRAVDOENC)} />
                                </Section>
                            </div>
                            <div style={{ marginTop: 3 }}>
                                <Section title="Populações Especiais">
                                    <FieldRow label="Privado de Liberdade" value={decodeField("POP_LIBER", selected.POP_LIBER)} />
                                    <FieldRow label="Situação de Rua" value={decodeField("POP_RUA", selected.POP_RUA)} />
                                    <FieldRow label="Trabalhador de Saúde" value={decodeField("POP_SAUDE", selected.POP_SAUDE)} />
                                    <FieldRow label="Imigrante" value={decodeField("POP_IMIG", selected.POP_IMIG)} />
                                    <FieldRow label="Beneficiário Gov." value={decodeField("BENEF_GOV", selected.BENEF_GOV)} />
                                </Section>
                            </div>

                            {/* Prediction */}
                            <div className="mb-4" style={{ marginTop: 3 }}>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                                    Previsão de Desfecho
                                </h4>
                                {predicting ? (
                                    <div className="bg-gray-50 rounded-lg px-3 py-4 flex items-center gap-2">
                                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full shrink-0" />
                                        <span className="text-sm text-gray-500">Calculando previsão...</span>
                                    </div>
                                ) : prediction ? (
                                    prediction.error ? (
                                        <div className="bg-gray-50 rounded-lg px-3 py-3 text-sm text-gray-400">
                                            Previsão indisponível: {prediction.error}
                                        </div>
                                    ) : (
                                        <div className={`rounded-lg px-4 py-3 border ${prediction.favorable
                                            ? "bg-green-50 border-green-200"
                                            : prediction.risk_level === "MEDIUM"
                                                ? "bg-yellow-50 border-yellow-200"
                                                : "bg-red-50 border-red-200"
                                            }`}>
                                            <p className={`text-sm font-semibold ${prediction.favorable
                                                ? "text-green-700"
                                                : prediction.risk_level === "MEDIUM"
                                                    ? "text-yellow-700"
                                                    : "text-red-700"
                                                }`}>
                                                {prediction.favorable
                                                    ? "Desfecho favorável previsto"
                                                    : prediction.risk_level === "MEDIUM"
                                                        ? "Risco moderado de desfecho desfavorável"
                                                        : "Alto risco de desfecho desfavorável"}
                                            </p>
                                            <p className={`text-xs mt-1 ${prediction.favorable
                                                ? "text-green-600"
                                                : prediction.risk_level === "MEDIUM"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                                }`}>
                                                Probabilidade: {(prediction.probability * 100).toFixed(1)}%
                                            </p>
                                            {prediction.features_used && (
                                                <p className="text-xs mt-1 text-gray-400">
                                                    {prediction.features_used} variáveis utilizadas na previsão
                                                </p>
                                            )}
                                        </div>
                                    )
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 px-6 text-center">
                            Selecione uma notificação para ver os detalhes.
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
