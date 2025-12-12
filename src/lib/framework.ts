export type FrameworkDetection = {
  framework: string;
  reason: string;
};

// HEADERS DETECTION
export function detectFrameworkFromHeaders(headers: Headers): string | null {
  const server = headers.get("server")?.toLowerCase() || "";
  const powered = headers.get("x-powered-by")?.toLowerCase() || "";
  const setCookie = headers.get("set-cookie")?.toLowerCase() || "";

  if (powered.includes("next.js")) return "Next.js";
  if (powered.includes("php")) return "PHP / Laravel";
  if (powered.includes("express")) return "Express.js";
  if (powered.includes("asp.net")) return "ASP.NET Core";

  if (server.includes("nginx") && powered.includes("wordpress"))
    return "WordPress";

  if (server.includes("shopify")) return "Shopify";
  if (server.includes("varnish") && setCookie.includes("magento"))
    return "Magento";

  if (server.includes("apache") && powered.includes("php"))
    return "PHP / Apache";

  if (setCookie.includes("wordpress")) return "WordPress";
  if (setCookie.includes("laravel")) return "Laravel";
  if (setCookie.includes("django")) return "Django";
  if (setCookie.includes("rails")) return "Ruby on Rails";

  return null;
}

export function detectFrameworkFromHTML(html: string): string | null {
  const lower = html.toLowerCase();

  if (lower.includes(`_next/static`)) return "Next.js";
  if (lower.includes(`_next/data`)) return "Next.js";
  if (lower.includes(`id="__next"`)) return "Next.js";
  if (lower.includes(`<script`) && lower.includes(`next-page`)) return "Next.js";

  if (lower.includes(`react`) || lower.includes(`__react`)) return "React SPA";
  if (lower.includes(`id="root"`)) return "React SPA";
  if (lower.includes(`data-reactroot`)) return "React SPA";

  
  if (lower.includes("data-remix-run")) return "Remix";

 
  if (lower.includes("astro-island")) return "Astro";

  // WORDPRESS
  if (lower.includes("wp-content") || lower.includes("wp-includes"))
    return "WordPress";

  // SHOPIFY
  if (lower.includes("shopify")) return "Shopify";

  // VIEW / VUE / NUXT
  if (lower.includes(`id="app"`) && lower.includes(`vue`)) return "Vue.js";
  if (lower.includes(`nuxt`)) return "Nuxt.js";

  // SVELTE
  if (lower.includes("svelte")) return "Svelte / SvelteKit";

  // ANGULAR
  if (lower.includes("ng-version")) return "Angular";

  // DRUPAL
  if (lower.includes("drupal")) return "Drupal";

  // GHOST CMS
  if (lower.includes("ghost-sdk")) return "Ghost CMS";

  // WEBFLOW
  if (lower.includes("webflow.js")) return "Webflow";

  // WIX
  if (lower.includes("wix-code")) return "Wix";

  return null;
}



export function detectFramework(html: string, headers: Headers): string {
  const headerResult = detectFrameworkFromHeaders(headers);
  if (headerResult) return headerResult;

  const htmlResult = detectFrameworkFromHTML(html);
  if (htmlResult) return htmlResult;

  return "Unknown";
}


export function getFrameworkAdvice(framework: string | null): string[] {
  if (!framework || framework === "Unknown") {
    return [
      "Framework not identified.",
      "Enable CDN caching.",
      "Compress all assets.",
      "Audit and reduce JS payload."
    ];
  }

  switch (framework) {
    case "Next.js":
      return [
        "Enable ISR / Route Segment Cache.",
        "Use Server Components.",
        "Use next/image for automatic optimization.",
        "Enable edge runtime where possible."
      ];

    case "React SPA":
      return [
        "Implement lazy-loading & code-splitting.",
        "Reduce client bundle weight.",
        "Cache expensive API calls."
      ];

    case "Nuxt.js":
      return [
        "Enable Nitro SSR optimization.",
        "Use @nuxt/image for media optimization.",
        "Enable payload extraction."
      ];

    case "Vue.js":
      return [
        "Enable production mode explicitly.",
        "Use dynamic imports to split bundles.",
        "Remove unused Vue directives."
      ];

    case "Svelte / SvelteKit":
      return [
        "Use server load functions for less JS.",
        "Deploy on edge for fast SSR.",
        "Minimize client-side hydration."
      ];

    case "Angular":
      return [
        "Use 'ng build --prod'.",
        "Adopt Standalone Components.",
        "Use OnPush change detection."
      ];

    case "WordPress":
      return [
        "Add caching plugin.",
        "Serve compressed WebP images.",
        "Remove unnecessary plugins."
      ];

    case "Laravel":
      return [
        "Enable OPcache.",
        "Optimize Composer autoload.",
        "Use Redis for query caching."
      ];

    case "Django":
      return [
        "Enable Django cache framework.",
        "Serve static files via whitenoise.",
        "Use Celery for heavy background tasks."
      ];

    case "Express.js":
      return [
        "Enable gzip compression.",
        "Add caching headers.",
        "Serve assets from a CDN."
      ];

    case "Shopify":
      return [
        "Avoid nested Liquid loops.",
        "Lazy-load product media.",
        "Use Shopify CDN for all assets."
      ];

    case "Ruby on Rails":
      return [
        "Enable asset pipeline caching.",
        "Use Redis caching.",
        "Avoid N+1 queries with eager loading."
      ];

    case "Webflow":
      return [
        "Use WebP images.",
        "Remove unused animations.",
        "Enable CDN caching."
      ];

    default:
      return [
        "Partial detection only.",
        "Make sure caches are enabled.",
        "Optimize images and reduce JS payload."
      ];
  }
}
