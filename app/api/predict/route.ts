import { NextRequest, NextResponse } from "next/server";

const RAILWAY_API_URL = process.env.RAILWAY_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
    try {
        const notification = await request.json();

        const response = await fetch(`${RAILWAY_API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notification),
        });

        if (!response.ok) {
            throw new Error(`Railway API error: ${response.status}`);
        }

        const data = await response.json();

        // Map Railway response to what SidePanel expects
        return NextResponse.json({
            favorable: data.prediction === 0,
            probability: data.prediction === 0 ? 1 - data.probability : data.probability,
            risk_level: data.risk_level,
            features_used: data.features_used,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Erro ao obter previsão" },
            { status: 500 }
        );
    }
}