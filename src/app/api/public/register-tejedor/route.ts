import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tejedores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as z from 'zod';

import { users } from '@/db/schema/users';
import { hashPassword } from '@/lib/auth';

const registrationSchema = z.object({
    cedulaTejedor: z.string().min(6).max(12),
    nombreTejedor: z.string().min(2).max(50),
    apellidoTejedor: z.string().min(2).max(50),
    fechaNacimiento: z.string().transform(val => new Date(val)),
    direccionTejedor: z.string().min(5).max(150),
    municipioTejedor: z.string().min(2).max(100),
    estadoTejedor: z.string().min(2).max(100),
    parroquiaTejedor: z.string().min(2).max(100),
    telefonoTejedor: z.string().min(10).max(15),
    correoTejedor: z.string().email().max(100),
    profesionTejedor: z.string().min(2).max(50),
    password: z.string().min(8),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = registrationSchema.parse(body);

        const [existingTejedor] = await db.select()
            .from(tejedores)
            .where(eq(tejedores.cedulaTejedor, validatedData.cedulaTejedor))
            .limit(1);

        if (existingTejedor) {
            return NextResponse.json({ error: 'Esta cédula ya se encuentra registrada como tejedor' }, { status: 400 });
        }

        const [existingUser] = await db.select()
            .from(users)
            .where(eq(users.username, validatedData.cedulaTejedor)) // Username = Cedula by default for new tejedores
            .limit(1);

        if (existingUser) {
            return NextResponse.json({ error: 'Ya existe un usuario con esta cédula' }, { status: 400 });
        }

        // Use transaction to ensure both records are created
        await db.transaction(async (tx) => {
            // 1. Create Tejedor record
            await tx.insert(tejedores).values({
                cedulaTejedor: validatedData.cedulaTejedor,
                nombreTejedor: validatedData.nombreTejedor,
                apellidoTejedor: validatedData.apellidoTejedor,
                fechaNacimiento: validatedData.fechaNacimiento,
                direccionTejedor: validatedData.direccionTejedor,
                municipioTejedor: validatedData.municipioTejedor,
                estadoTejedor: validatedData.estadoTejedor,
                parroquiaTejedor: validatedData.parroquiaTejedor,
                telefonoTejedor: validatedData.telefonoTejedor,
                correoTejedor: validatedData.correoTejedor,
                profesionTejedor: validatedData.profesionTejedor,
                fechaIngreso: new Date(),
                tipodeVoluntario: 'Aspirante',
            });

            // 2. Create User record (unapproved)
            const hashedPassword = await hashPassword(validatedData.password);
            await tx.insert(users).values({
                username: validatedData.cedulaTejedor,
                password: hashedPassword,
                role: 'tejedor',
                approved: false, // Must be approved by admin
                cedulaTejedor: validatedData.cedulaTejedor,
            });
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos de registro inválidos', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Public registration error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
