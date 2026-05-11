import { NextRequest, NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';
import os from "os";

import { DBFFile } from 'dbffile';
import { SinanTuberculoseRecord } from "@/app/utils/enum";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Arquivo é obrigatório' }, // TODO: Better error messages
                { status: 400 }
            );
        }

        // creating tmp directory
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-'));

        const originalName = file.name || 'arquivo.dbf';
        const dbfPath = path.join(tmpDir, originalName);

        // save file
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(dbfPath, buffer);

        // reading dbf
        const dbfFile = await DBFFile.open(dbfPath);
        const dbfRecords = (await dbfFile.readRecords()) as unknown as SinanTuberculoseRecord[];
        const notifications = dbfRecords.filter(r => r.SG_UF === "43" || r.SG_UF === "RS");

        return NextResponse.json({ notifications });
    } catch(error: any) {
        return NextResponse.json(
            { error: error.message || 'Erro ao processar arquivo' },  // TODO: Better error messages
            { status: 400 }
        );
    }
}