import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';
import os from 'os';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const host = process.env.DB_HOST || 'localhost';
        const user = process.env.DB_USER || 'root';
        const password = process.env.DB_PASSWORD || '';
        const database = process.env.DB_NAME || 'tejiendo_redes';
        const port = process.env.DB_PORT || '3306';

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${database}-${timestamp}.sql`;
        const tempFilePath = path.join(os.tmpdir(), filename);

        // Find mysqldump path
        let dumpCommand = 'mysqldump';
        if (process.env.MYSQLDUMP_PATH && fs.existsSync(process.env.MYSQLDUMP_PATH)) {
            dumpCommand = process.env.MYSQLDUMP_PATH;
        } else {
            const possiblePaths = [
                'C:\\xampp\\mysql\\bin\\mysqldump.exe',
                'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
                '/usr/bin/mysqldump',
                '/usr/local/bin/mysqldump'
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    dumpCommand = p;
                    break;
                }
            }
        }

        const args = [
            '-h', host,
            '-P', port,
            '-u', user,
            ...(password ? [`-p${password}`] : []),
            '--column-statistics=0',
            '--no-tablespaces',
            `--result-file=${tempFilePath}`,
            database
        ];


        await new Promise<void>((resolve, reject) => {
            const child = spawn(dumpCommand, args, {
                shell: false,
                stdio: 'ignore'
            });

            child.on('error', (err) => {
                reject(new Error(`Failed to start mysqldump: ${err.message}`));
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`mysqldump exited with code ${code}`));
                }
            });
        });

        const fileBuffer = fs.readFileSync(tempFilePath);
        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {
            console.warn('Failed to delete temp file:', e);
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename=${filename}`,
                'Content-Type': 'application/sql',
            },
        });

    } catch (error: any) {
        console.error('Backup error:', error);
        return NextResponse.json(
            { error: 'Error al generar el respaldo', details: error.message },
            { status: 500 }
        );
    }
}
