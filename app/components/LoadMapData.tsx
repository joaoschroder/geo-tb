"use client";

import { useRef, useState } from "react";
import { Data } from "../utils/enum";
import { Dbf } from "dbf-reader";

type Props = {
    onDataLoaded: (data: Data) => void;
}

export default function LoadMapData({ onDataLoaded }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    function errorAlert(msg: string) {
        alert(msg);
        setLoading(false);
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setLoading(true);

        try {
            const file = e.target.files?.[0];
            if (!file) {
                errorAlert("Arquivo é obrigatório");
                return;
            }

            const ext = file.name.split(".").pop()?.toLowerCase();
            if (ext !== "dbf") {
                errorAlert("Apenas arquivos no formato .dbf");
                return;
            }

            setFileName(file.name);

            // Parse entirely in browser
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const datatable = Dbf.read(buffer);

            const records = datatable.rows.map((row: any) => {
                const record: Record<string, any> = {};
                datatable.columns.forEach((col: any) => {
                    const val = row[col.name];
                    record[col.name] = val !== null && val !== undefined
                        ? String(val).trim()
                        : "";
                });
                return record;
            });

            const notifications = records.filter((r: any) =>
                String(r.SG_UF ?? "").trim() === "43" ||
                String(r.SG_UF ?? "").trim() === "RS"
            );

            onDataLoaded({ notifications } as Data);

        } catch (err: any) {
            errorAlert("Erro ao processar o arquivo: " + err.message);
        } finally {
            setLoading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className="flex items-center gap-3" style={{ marginLeft: 50 }}>
            {/* Hidden native input */}
            <input
                ref={inputRef}
                type="file"
                accept=".dbf"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {/* Custom button */}
            <button
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                style={{
                    padding: "10px 25px",
                    borderRadius: "12px",
                    backgroundColor: loading ? "#666" : "darkgreen",
                    color: "white",
                    fontWeight: 500,
                    border: "none",
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                }}
            >
                {loading ? "Processando..." : "Carregar arquivo DBF"}
            </button>

            {/* File name display */}
            {fileName && !loading && (
                <span style={{
                    fontSize: 13,
                    color: "#555",
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>
                    ✓ {fileName}
                </span>
            )}
        </div>
    );
}