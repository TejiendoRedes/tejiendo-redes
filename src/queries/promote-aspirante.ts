"use server";


import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { aspirantes } from '@/db/schema/aspirantes';
import { tejedores } from '@/db/schema/tejedores';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

/**
 * Promover un aspirante a tejedor
 */
