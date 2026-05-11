"use client";

import { useRef, useState } from "react";
import { Data } from "../utils/enum";

type Props = {
    onDataLoaded: (data: Data) => void;
}

export default function LoadMapData({ onDataLoaded }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dataFromFile, setDataFromFile] = useState<Data | null>(null);
    const [loading, setLoading] = useState(false);

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

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/process", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                errorAlert("Erro ao processar o arquivo");
                return;
            }

            const data: Data = await res.json();

            onDataLoaded(data);
            setDataFromFile(data);
        } finally {
            setLoading(false);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }

    return (
        <div className="flex flex-col items-start gap-4">
            {/* input escondido */}
            <input
                ref={inputRef}
                type="file"
                accept=".dbf"
                onChange={handleFileChange}
                style={{
                    padding: "10px 25px",
                    borderRadius: "12px",
                    backgroundColor: "darkgreen",
                    color: "white",
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.15s ease",
                    marginLeft: 50,
                }}
            />
        </div>
    );
}