import { CollectionEntry, getCollection } from "astro:content";

export async function getAllPosts() {
    return await getCollection('blog')
}

export const byLatest = (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) => a.data.date < b.data.date ? 1 : -1;
