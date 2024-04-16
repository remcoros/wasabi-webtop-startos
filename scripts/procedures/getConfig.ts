import { compat, types as T } from "../deps.ts";

export const getConfig: T.ExpectedExports.getConfig = compat.getConfig({
  title: {
    type: "string",
    nullable: false,
    name: "Webtop Title",
    description:
      "This value will be displayed as the title of your browser tab.",
    default: "Start9 Wasabi on Webtop",
    pattern: '^[^\\n"]*$',
    "pattern-description": "Must not contain newline or quote characters.",
    masked: false,
    copyable: true,
  },
  username: {
    type: "string",
    nullable: false,
    name: "Username",
    description: "The username for logging into your Webtop.",
    default: "webtop",
    pattern: '^[^\\n"]*$',
    "pattern-description": "Must not contain newline or quote characters.",
    masked: false,
    copyable: true,
  },
  password: {
    type: "string",
    name: "Password",
    description: "The password for logging into your Webtop.",
    nullable: false,
    masked: true,
    default: {
      charset: "a-z,1-9",
      len: 20,
    },
    pattern: '^[^\\n"]*$',
    "pattern-description": "Must not contain newline or quote characters.",
    copyable: true,
  },
  wasabi: {
    type: "object",
    name: "Wasabi settings",
    description: "Wasabi settings",
    spec: {
      managesettings: {
        type: "boolean",
        name: "Apply settings on startup",
        description:
          "Disable to manage your own settings in Wasabi",
        default: true,
      },
      server: {
        type: "union",
        name: "Bitcoin Core",
        description:
          "<p>The Bitcoin Core node to connect to:</p><ul><li><strong>Bitcoin Core</strong>: Use the Bitcoin Core service installed on your server.</li><li><strong>None</strong>: Use public Bitcoin nodes.</li></ul>",
        tag: {
          id: "type",
          name: "Bitcoin Node Type",
          "variant-names": {
            bitcoind: "Bitcoin Core (recommended)",
            none: "None",
          },
          description:
            "<p>The Bitcoin Core node to connect to:</p><ul><li><strong>Bitcoin Core</strong>: Use the Bitcoin Core service installed on your server.</li><li><strong>None</strong>: Use public Bitcoin nodes.</li></ul>",
        },
        default: "bitcoind",
        variants: {
          bitcoind: {},
          none: {},
        },
      },
    },
  },
});
