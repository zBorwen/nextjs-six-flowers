"use server";

import { prisma } from "@rikka/database";
import { revalidatePath } from "next/cache";

export async function updateProfile(userId: string, name: string) {
    if (!userId || !name) throw new Error("Missing userId or name");

    await prisma.user.update({
        where: { id: userId },
        data: { name },
    });

    revalidatePath("/");
}
