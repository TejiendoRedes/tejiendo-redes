import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aspirantes, auditLogs } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { registerSchema } from '@/schemas/auth';
import { sanitizeObject } from '@/lib/security/sanitize';

export async function POST(request: Request) {
    const startTime = Date.now();

    try {
        const body = await request.json();

        // 1. Zod Validation
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos de registro inválidos', details: result.error.format() },
                { status: 400 }
            );
        }

        const data = result.data;

        // 2. Honeypot check
        if (data.honeypot) {
            return NextResponse.json({ error: 'Bot detected' }, { status: 400 });
        }

        // 3. Submission time check (prevent bots)
        if (data.submissionTime) {
            const timeElapsed = Date.now() - parseInt(data.submissionTime);
            if (timeElapsed < 2000) {
                return NextResponse.json({ error: 'Too fast' }, { status: 400 });
            }
        }

        // 4. Input Sanitization
        const sanitized = sanitizeObject({
            cedulaAspirante: data.cedulaAspirante,
            nombreAspirante: data.nombreAspirante,
            apellidoAspirante: data.apellidoAspirante,
            direccionAspirante: data.direccionAspirante,
            municipioAspirante: data.municipioAspirante,
            estadoDireccionAspirante: data.estadoDireccionAspirante,
            parroquiaAspirante: data.parroquiaAspirante,
            telefonoAspirante: data.telefonoAspirante,
            correoAspirante: data.correoAspirante,
            profesionAspirante: data.profesionAspirante,
        });

        // 5. Check if aspirante already exists
        const [existing] = await db.select()
            .from(aspirantes)
            .where(or(
                eq(aspirantes.cedulaAspirante, sanitized.cedulaAspirante),
                eq(aspirantes.correoAspirante, sanitized.correoAspirante)
            ))
            .limit(1);

        if (existing) {
            await preventTimingAttack(startTime);
            return NextResponse.json(
                { error: 'Ya existe una solicitud con esta cédula o correo electrónico' },
                { status: 400 }
            );
        }

        // 6. Database Operation
        await db.transaction(async (tx) => {
            // Insert into aspirantes
            await tx.insert(aspirantes).values({
                cedulaAspirante: sanitized.cedulaAspirante,
                nombreAspirante: sanitized.nombreAspirante,
                apellidoAspirante: sanitized.apellidoAspirante,
                fechaNacimiento: new Date(data.fechaNacimiento),
                direccionAspirante: sanitized.direccionAspirante,
                municipioAspirante: sanitized.municipioAspirante,
                estadoDireccionAspirante: sanitized.estadoDireccionAspirante,
                parroquiaAspirante: sanitized.parroquiaAspirante,
                telefonoAspirante: sanitized.telefonoAspirante,
                correoAspirante: sanitized.correoAspirante,
                profesionAspirante: sanitized.profesionAspirante,
                fechaPostulacion: new Date(),
                estadoAspirante: 'Pendiente',
            });

            // Log the postulation
            const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
            const userAgent = request.headers.get('user-agent') || 'unknown';

            await tx.insert(auditLogs).values({
                userId: null, // System/Unauthenticated action (no user logged in)
                action: 'NEW_ASPIRANTE_POSTULATION',
                entity: 'ASPIRANTES',
                entityId: sanitized.cedulaAspirante,
                details: `Nueva postulación de aspirante: ${sanitized.correoAspirante}`,
                ipAddress: ip,
                userAgent: userAgent
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Postulación enviada exitosamente. El administrador revisará su solicitud.'
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

async function preventTimingAttack(startTime: number) {
    const minTime = 2000;
    const elapsed = Date.now() - startTime;
    if (elapsed < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
    }
}
