import IO from "effective.ts";
import { URL } from "url";
import fetch from "node-fetch";
import { isInstanceOf, parseUrl, printLine, repeatString } from "./utils";
import { WebPage } from "./webPage";

export interface CrawlerOptions {
  maxDepth: number;
}

export class Crawler {
  readonly maxDepth: number;

  constructor(options: CrawlerOptions) {
    this.maxDepth = options.maxDepth;
  }

  crawl(startingUrl: string): IO<WebPage, Error> {
    return this.parseStartingUrl(startingUrl)
      .andThen((url) => this.crawlPage(url))
      .mapError((thrown) =>
        thrown instanceof Error ? thrown : Error(String(thrown))
      );
  }

  private parseStartingUrl(startingUrl: string): IO<URL, Error> {
    const urlOrError = parseUrl(startingUrl);
    if (urlOrError instanceof URL) return IO.wrap(urlOrError);
    return IO.raise(Error("Invalid starting URL"));
  }

  private crawlPage(pageUrl: URL, depth = 0): IO<WebPage> {
    return this.fetchPageText(pageUrl)
      .map((html) => WebPage.fromHtml(pageUrl, html))
      .andThen((page) =>
        printLine(
          repeatString(" ", depth) + "- " + (page.title ?? "(no title)")
        )
          .andThen(() =>
            depth < this.maxDepth
              ? IO.parallel(
                  this.crawlableLinks(page).map((url) =>
                    this.crawlPage(url, depth + 1).mapError(() => null)
                  )
                )
              : IO.wrap([])
          )
          .as(page)
      );
  }

  private crawlableLinks(webPage: WebPage): URL[] {
    return webPage.links
      .map((href) => parseUrl(href, webPage.url))
      .filter(isInstanceOf(URL));
  }

  private fetchPageText(url: URL): IO<string> {
    return IO.lift(fetch)(url.toString()).andThen((response) =>
      IO(() => response.text())
    );
  }
}
