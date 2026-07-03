import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // Fallback redirect logic in case middleware is bypassed
    switch (session.role) {
        case 'superuser':
        case 'admin':
            redirect('/dashboard/admin');
        case 'tejedor':
            redirect('/dashboard/tejedor');
        case 'medico':
            redirect('/atencion-medica');
        case 'operador':
            redirect('/datos-basicos');
        default:
            redirect('/login');
    }
}
