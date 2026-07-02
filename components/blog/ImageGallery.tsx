"use client";

import { BlogImage } from "@/lib/types";

interface ImageGalleryProps {
  images: BlogImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (!images || images.length === 0) return null;

  const banner = images.find((img) => img.placement === "banner");

  return (
    <>
      {banner && (
        <figure className="w-full rounded-xl overflow-hidden mb-6">
          <img
            src={banner.url}
            alt={banner.alt_text}
            className="w-full h-64 md:h-80 object-cover"
          />
          <figcaption className="text-xs text-gray-400 mt-2 px-1">
            Photo by {banner.credit}
          </figcaption>
        </figure>
      )}
    </>
  );
}

export function SectionImage({ image }: { image: BlogImage }) {
  return (
    <figure className="my-4 rounded-lg overflow-hidden">
      <img
        src={image.url}
        alt={image.alt_text}
        className="w-full h-48 md:h-56 object-cover rounded-lg"
      />
      <figcaption className="text-xs text-gray-400 mt-1 px-1">
        Photo by {image.credit}
      </figcaption>
    </figure>
  );
}
