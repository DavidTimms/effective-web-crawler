import IO from "effective.ts";
import { Crawler, CrawlerOptions } from "./crawler";
import { ExitCode, printError, script } from "./utils";

const DEFAULT_OPTIONS: CrawlerOptions = {
  maxDepth: 2,
};

script((...args) =>
  parseScriptArguments(args)
    .andThen(({ startingUrl, options }) =>
      new Crawler(options).crawl(startingUrl).as(ExitCode.Ok)
    )
    .catch((error) => printError(`ERROR: ${error.message}`).as(ExitCode.Error))
);

function parseScriptArguments(
  args: string[]
): IO<{ startingUrl: string; options: CrawlerOptions }, Error> {
  if (args.length > 0) {
    const [startingUrl, ...otherArgs] = args;
    const options = parseOptions(otherArgs);
    return IO.wrap({ startingUrl, options });
  } else {
    return IO.raise(Error("No starting URL provided"));
  }
}

function parseOptions(args: string[]): CrawlerOptions {
  return args.reduce(
    (options, arg, index) =>
      arg === "--maxDepth"
        ? { options, maxDepth: Number(args[index + 1]) }
        : options,
    DEFAULT_OPTIONS
  );
}
