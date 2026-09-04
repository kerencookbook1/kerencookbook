import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "המטבח של קרן",
    short_name: "המטבח של קרן",
    description: "ספר מתכונים אישי ומשפחתי",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf2",
    theme_color: "#d84b32",
    lang: "he",
    dir: "rtl",
  };
}
