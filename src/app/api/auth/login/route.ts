import { NextResponse } from 'next/server';
import { encrypt, comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { usuario, password } = body;

        if (!usuario || !password) {
            return NextResponse.json(
                { error: 'Usuario y contraseña requeridos' },
                { status: 400 }
            );
        }

        // Buscar el usuario en la base de datos
        const [user] = await db.select()
            .from(users)
            .where(eq(users.username, usuario))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Verificar la contraseña contra el hash
        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        if (!user.approved) {
            return NextResponse.json(
                { error: 'Su cuenta está pendiente de aprobación' },
                { status: 403 }
            );
        }

        // Actualizar último login
        await db.update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user.id));

        // Crear sesión con los datos del usuario y su rol
        const userPayload = {
            id: user.id,
            nombreTejedor: user.username,
            cedulaTejedor: user.cedulaTejedor || '00000000',
            role: user.role,
            usuario: user.username
        };

        // Crear token
        const token = await encrypt(userPayload);

        // Configurar cookie
        const cookieStore = await cookies();
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return NextResponse.json({
            success: true,
            user: userPayload,
            redirectTo: user.role === 'superuser' ? '/dashboard/super-usuario' :
                user.role === 'admin' ? '/dashboard/admin' :
                    user.role === 'tejedor' ? '/dashboard/tejedor' : '/dashboard'
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
