import { type CollectionEntry, getCollection } from "astro:content";
import crypto from "crypto"

export async function getAllPosts() {
    return await getCollection('blog')
}

export async function getPostBanner(blogPost: CollectionEntry<"blog">) {
    const defaultBannerImages = Object.values(import.meta.glob<{default: ImageMetadata}>('public/assets/images/blog/default/*.webp'))
    // const hashBuffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(blogPost.id))
    // const hashArray = new Uint8Array(hashBuffer);
    // const num = new DataView(hashArray.buffer).getUint32(0, false); // Big-endian
    const hash = crypto.createHash('md5').update(blogPost.id).digest()
    const num = hash.readUInt32BE(0)
    const getDefaultImage = defaultBannerImages[num % defaultBannerImages.length]
    const defaultImagePath = (getDefaultImage === undefined ? undefined : (await getDefaultImage()).default.src) ?? "/assets/images/blog_banner.webp"

    return defaultImagePath
}

export const byLatest = (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) => a.data.date < b.data.date ? 1 : -1;
