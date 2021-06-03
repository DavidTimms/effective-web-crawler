import IO from "effective/src/io";
import { Crawler } from "./crawler";
import { ExitCode, printError, printLine, script } from "./utils";

script((startingUrl: string | undefined, ...args) =>
  startingUrl
    ? new Crawler({
        maxDepth: 2,
      })
        .crawl(startingUrl)
        .as(ExitCode.Ok)
    : printError("ERROR: No starting URL provided").as(ExitCode.Error)
);
