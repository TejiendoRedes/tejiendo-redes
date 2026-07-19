import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

// Schema for Tejedor validation
const TejedorSchema = z.object({
    cedulaTejedor: z.string().min(1, 'La cédula es requerida'),
    nombreTejedor: z.string().min(1, 'El nombre es requerido'),
    apellidoTejedor: z.string().min(1, 'El apellido es requerido'),
    fechaNacimiento: z.coerce.date({ required_error: 'Fecha de nacimiento requerida' }),
    direccionTejedor: z.string().min(1, 'La dirección es requerida'),
    parroquiaId: z.coerce.number(),
    telefonoTejedor: z.string().default(''),
    correoTejedor: z.string().email('Correo inválido').optional().or(z.literal('')).default(''),
    profesionTejedor: z.string().default(''),
    fechaIngreso: z.coerce.date({ required_error: 'Fecha de ingreso requerida' }),
    tipodeVoluntario: z.string().default(''),
});

/**
 * GET /api/tejedores
 * Obtiene todos los tejedores o uno específico por cédula
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const cedula = searchParams.get('cedula');

        if (cedula) {
            // Obtener un tejedor específico
            const tejedor = await db.select()
                .from(schema.tejedores)
                .where(eq(schema.tejedores.cedulaTejedor, cedula))
                .limit(1);

            if (tejedor.length === 0) {
                return NextResponse.json(
                    { error: 'Tejedor no encontrado' },
                    { status: 404 }
                );
            }

            return NextResponse.json(tejedor[0]);
        }

        // Obtener todos los tejedores
        const tejedores = await db.select({
            cedulaTejedor: schema.tejedores.cedulaTejedor,
            nombreTejedor: schema.tejedores.nombreTejedor,
            apellidoTejedor: schema.tejedores.apellidoTejedor,
            profesionTejedor: schema.tejedores.profesionTejedor,
            tipodeVoluntario: schema.tejedores.tipodeVoluntario,
        }).from(schema.tejedores);

        return NextResponse.json(tejedores);
    } catch (error) {
        console.error('Error fetching tejedores:', error);
        return NextResponse.json(
            { error: 'Error al obtener tejedores' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tejedores
 * Crea un nuevo tejedor
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();

        // Validar con Zod
        const validation = TejedorSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.errors },
                { status: 400 }
            );
        }

        const newTejedor = validation.data;

        // Validar duplicados (aunque la DB lo hará, es mejor chequear antes para mensaje claro)
        const existing = await db.select({ cedula: schema.tejedores.cedulaTejedor })
            .from(schema.tejedores)
            .where(eq(schema.tejedores.cedulaTejedor, newTejedor.cedulaTejedor))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'Ya existe un tejedor con esa cédula' },
                { status: 409 }
            );
        }

        // Insertar en la base de datos
        await db.insert(schema.tejedores).values(newTejedor);

        return NextResponse.json(
            { message: 'Tejedor creado exitosamente', data: newTejedor },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating tejedor:', error);
        return NextResponse.json(
            { error: 'Error al crear tejedor' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/tejedores?cedula={cedula}
 * Actualiza un tejedor existente
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const cedula = searchParams.get('cedula');

        if (!cedula) {
            return NextResponse.json(
                { error: 'Cédula requerida en query params' },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Validar cuerpo parcial con Zod
        const validation = TejedorSchema.partial().safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.errors },
                { status: 400 }
            );
        }

        // No permitir actualizar la cédula por esta vía (clave primaria)
        const { cedulaTejedor, ...updateData } = validation.data;

        // Actualizar en la base de datos
        await db.update(schema.tejedores)
            .set(updateData)
            .where(eq(schema.tejedores.cedulaTejedor, cedula));

        return NextResponse.json({
            message: 'Tejedor actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error updating tejedor:', error);
        return NextResponse.json(
            { error: 'Error al actualizar tejedor' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/tejedores?cedula={cedula}
 * Elimina un tejedor
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const cedula = searchParams.get('cedula');

        if (!cedula) {
            return NextResponse.json(
                { error: 'Cédula requerida en query params' },
                { status: 400 }
            );
        }

        await db.delete(schema.tejedores)
            .where(eq(schema.tejedores.cedulaTejedor, cedula));

        return NextResponse.json({
            message: 'Tejedor eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting tejedor:', error);
        return NextResponse.json(
            { error: 'Error al eliminar tejedor. Puede haber registros relacionados.' },
            { status: 500 }
        );
    }
}
