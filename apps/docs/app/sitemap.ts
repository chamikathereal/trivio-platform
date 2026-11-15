import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://docs.trivio.ink";
  const routes = [
    "",
    "/installation",
    "/architecture",
    "/quickstart/core",
    "/quickstart/node",
    "/quickstart/react",
    "/fees",
    "/calendars",
    "/timezones",
    "/precision",
    "/errors",
    "/security",
    "/api-reference",
    "/licensing",
    "/faq",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
