import { compat, types as T } from "../deps.ts";

export const migration: T.ExpectedExports.migration =
  compat.migrations.fromMapping(
    {
      "2.2.1.1": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            config["reconnect"] = false;
            return config;
          },
          true,
          { version: "2.2.1.1", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            delete config["reconnect"];
            return config;
          },
          true,
          { version: "2.2.1.1", type: "down" }
        ),
      },
      "2.6.0": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            // this migration looks like a no-op, but it makes sure that we have the rpc user/pass pointers to bitcoind
            return config;
          },
          true,
          {
            version: "2.6.0",
            type: "up",
          }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            return config;
          },
          true,
          { version: "2.6.0", type: "down" }
        ),
      },
    },
    "2.7.0"
  );
