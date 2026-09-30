import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BATTLEXA | Esports Tournaments",
    short_name: "BATTLEXA",
    description:
      "Premier Esports Platform for Free Fire MAX and BGMI. Compete in daily custom rooms, scrims, and win verified cash prizes.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090E",
    theme_color: "#08090E",
    orientation: "portrait",
    categories: ["games", "entertainment", "sports"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=192&h=192&fit=crop",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=512&h=512&fit=crop",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
