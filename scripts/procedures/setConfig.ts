import { compat, types as T } from "../deps.ts";

// Define a custom type for T.Config to include the 'server' property with a 'type' property
interface WasabiConfig extends T.Config {
  wasabi?: {
    server?: {
      type?: string;
    };
  };
}

// deno-lint-ignore require-await
export const setConfig: T.ExpectedExports.setConfig = async (
  effects: T.Effects,
  newConfig: WasabiConfig,
) => {
  const depsBitcoind: { [key: string]: string[] } =
    newConfig?.wasabi?.server?.type === "bitcoind" ? { "bitcoind": [] } : {};

  return compat.setConfig(effects, newConfig, {
    ...depsBitcoind,
  });
};
