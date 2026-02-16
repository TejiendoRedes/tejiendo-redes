import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execAsync = promisify(exec);

export async function GET() {
    try {
        const host = process.env.DATABASE_HOST || 'localhost';
        const user = process.env.DATABASE_USER || 'root';
        const password = process.env.DATABASE_PASSWORD || '';
        const database = process.env.DATABASE_NAME || 'bd_sistema_abordajes';
        const port = process.env.DATABASE_PORT || '3306';

        // Create a temporary file path
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${database}-${timestamp}.sql`;
        const tempFilePath = path.join(os.tmpdir(), filename);

        // Determine mysqldump executable path
        // Priority 1: Environment variable (Best for Server/Docker)
        // Priority 2: Common Windows Paths (XAMPP/MySQL Server) (Best for Local Dev)
        // Priority 3: Global command (Best for properly configured Linux/Windows envs)

        let dumpCommand = 'mysqldump'; // Default fallback

        if (process.env.MYSQLDUMP_PATH && fs.existsSync(process.env.MYSQLDUMP_PATH)) {
            dumpCommand = `"${process.env.MYSQLDUMP_PATH}"`;
        } else {
            // Check common local paths if env var is not set
            const possiblePaths = [
                'C:\\xampp\\mysql\\bin\\mysqldump.exe',
                'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
                '/usr/bin/mysqldump', // Common Linux path
                '/usr/local/bin/mysqldump' // MacOS/Linux
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    dumpCommand = `"${p}"`;
                    break;
                }
            }
        }

        // Construct the mysqldump command
        // We add --column-statistics=0 to avoid issues with some mysql versions
        // We use --no-tablespaces to avoid permission issues
        const command = `${dumpCommand} -h ${host} -P ${port} -u ${user} ${password ? `-p${password}` : ''} --column-statistics=0 --no-tablespaces ${database} > "${tempFilePath}"`;

        console.log('Starting database backup...');
        // Log command for debugging (masking password)
        console.log('Command:', command.replace(password, '****'));

        // Execute the command
        await execAsync(command);
        console.log('Backup created at:', tempFilePath);

        // Read the file
        const fileBuffer = fs.readFileSync(tempFilePath);

        // Delete the temp file after reading
        fs.unlinkSync(tempFilePath);

        // Return the file as a download
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: any) {
        console.error('Backup failed:', error);
        return NextResponse.json(
            { error: 'Failed to create backup', details: error.message },
            { status: 500 }
        );
    }
}
