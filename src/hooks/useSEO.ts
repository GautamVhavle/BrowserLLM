import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

const BASE_URL = "https://browserllm.xyz";
const SITE_NAME = "BrowserLLM";
const DEFAULT_IMAGE = `${BASE_URL}/title.png`;

function setMeta(name: string, content: string, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Lightweight per-route SEO: updates title, meta description,
 * canonical, Open Graph, and Twitter tags on each navigation.
 */
export function useSEO({ title, description, path, noindex }: SEOConfig) {
  useEffect(() => {
    const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
    const fullUrl = `${BASE_URL}${path}`;

    document.title = fullTitle;

    // Primary
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setLink("canonical", fullUrl);

    // Open Graph
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", fullUrl, "property");
    setMeta("og:image", DEFAULT_IMAGE, "property");

    // Twitter
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:url", fullUrl);
    setMeta("twitter:image", DEFAULT_IMAGE);
  }, [title, description, path, noindex]);
}
