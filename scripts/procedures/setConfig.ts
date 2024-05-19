import { compat, types as T } from "../deps.ts";
import { Config, setConfigMatcher } from "./getConfig.ts";

export const setConfig: T.ExpectedExports.setConfig = async (
  effects: T.Effects,
  input: T.Config,
) => {
  const config: Config = setConfigMatcher.unsafeCast(input);
  const depsBitcoind: { [key: string]: string[] } =
    config.wasabi.server.type === "bitcoind" ? { "bitcoind": [] } : {};

  return await compat.setConfig(effects, config, {
    ...depsBitcoind,
  });
};
