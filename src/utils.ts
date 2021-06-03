import { URL } from "url";
import IO from "effective/src/io";

export enum ExitCode {
  Ok = 0,
  Error = 1,
}

const exitProcess = IO.lift(process.exit.bind(process));

export function script(program: (...args: string[]) => IO<ExitCode>): void {
  program(...process.argv.slice(2))
    .catch((error) => printError(error).as(ExitCode.Error))
    .andThen(exitProcess)
    .run();
}

export const printLine = IO.lift(console.log);
export const printError = IO.lift(console.error);

export function parseUrl(input: string, base?: string | URL): URL | TypeError {
  try {
    return new URL(input, base);
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      return error;
    }
    throw error;
  }
}

export function repeatString(s: string, times: number): string {
  if (times === 0) return "";
  return s + repeatString(s, times - 1);
}

export function isInstanceOf<Class>(constructor: {
  new (...args: any[]): Class;
}): (object: unknown) => object is Class {
  return (object): object is Class => object instanceof constructor;
}
