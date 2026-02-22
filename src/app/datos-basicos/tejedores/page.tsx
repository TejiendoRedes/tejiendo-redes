import { getTejedores } from '@/queries/tejedores';;
import TejedoresClient from '@/components/features/tejedores/tejedores-client';

export default async function TejedoresPage() {
    // Fetch data directly from the database via Server Action (or just DB call since we are on server)
    // Using the action is fine to keep logic encapsulated, or better yet, import the DB call directly if preferred.
    // Given the action handles errors and returns a wrapper object, let's use it.
    const { data: tejedores, success } = await getTejedores();

    if (!success || !tejedores) {
        // Handle error state appropriately
        return <div>Error al cargar los tejedores</div>;
    }

    return <TejedoresClient initialData={tejedores} />;
}
