import { URL } from "url";

export interface WebPage {
  url: URL;
  title: string | null;
  links: string[];
}

export const WebPage = {
  fromHtml(url: URL, html: string): WebPage {
    return {
      url,
      title: extractTitle(html),
      links: extractLinks(html),
    };
  },
};

const TITLE_REGEX = /<\s*title[^>]*>(.*?)<\/\s*title\s*>/;
const LINK_REGEX = /<\s*a[^>]*href=("[^"]+"|'[^']+')[^>]*>/g;

function extractTitle(html: string): string | null {
  return html.match(TITLE_REGEX)?.[1] ?? null;
}

function extractLinks(html: string): string[] {
  return Array.from(html.matchAll(LINK_REGEX)).map((match) =>
    match[1].slice(1, -1)
  );
}
