import * as cheerio from "cheerio";

export async function generatePreview(url: string) {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const $ = cheerio.load(html);

    const title = $("title").text();
    const description =
      $('meta[name="description"]').attr("content") || "";
    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      null;

    return {
      url,
      title,
      description,
      favicon: favicon ? new URL(favicon, url).toString() : null,
    };
  } catch {
    return {
      error: "Unable to fetch website.",
      url,
    };
  }
}
