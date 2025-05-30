import { compat } from "../deps.ts";

export const [getConfig, setConfigMatcher] = compat.getConfigAndMatcher({
  title: {
    type: "string",
    nullable: false,
    name: "Webtop Title",
    description:
      "This value will be displayed as the title of your browser tab.",
    default: "Wasabi on StartOS",
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
  reconnect: {
    type: "boolean",
    name: "Automatically reconnect",
    description:
      "Automatically reconnect when the connection to the desktop is lost or the browser tab has been idle for too long.",
    default: false,
  },
  wasabi: {
    type: "object",
    name: "Wasabi settings",
    description: "Wasabi settings",
    spec: {
      managesettings: {
        type: "boolean",
        name: "Apply settings on startup",
        description: "Disable to manage your own settings in Wasabi",
        default: true,
      },
      server: {
        type: "union",
        name: "Bitcoin Node",
        description:
          "<p>The Bitcoin node to connect to:</p><ul><li><strong>Bitcoin Node</strong>: Use the Bitcoin service installed on your server.</li><li><strong>None</strong>: Use public Bitcoin nodes.</li></ul>",
        tag: {
          id: "type",
          name: "Bitcoin Node Type",
          "variant-names": {
            bitcoind: "Bitcoin Node (recommended)",
            none: "None",
          },
          description:
            "<p>The Bitcoin node to connect to:</p><ul><li><strong>Bitcoin Node</strong>: Use the Bitcoin service installed on your server.</li><li><strong>None</strong>: Use public Bitcoin nodes.</li></ul>",
        },
        default: "bitcoind",
        variants: {
          bitcoind: {
            user: {
              type: "pointer",
              name: "RPC Username",
              description: "The username for Bitcoin's RPC interface",
              subtype: "package",
              "package-id": "bitcoind",
              target: "config",
              multi: false,
              selector: "$.rpc.username",
            },
            password: {
              type: "pointer",
              name: "RPC Password",
              description: "The password for Bitcoin's RPC interface",
              subtype: "package",
              "package-id": "bitcoind",
              target: "config",
              multi: false,
              selector: "$.rpc.password",
            },
          },
          none: {},
        },
      },
      useTor: {
        type: "boolean",
        name: "Network anonymization (Tor)",
        description: "Configure Wasabi to use the Tor network.",
        default: true,
      },
      rpc: {
        type: "object",
        name: "RPC Settings",
        description: "Json RPC server settings.",
        spec: {
          enable: {
            type: "boolean",
            name: "Enable",
            description: "Enable the Json RPC server.",
            default: false,
          },
          username: {
            type: "string",
            nullable: false,
            name: "Username",
            description: "The username for connecting to Wasabi over RPC.",
            warning:
              "You will need to restart all services that depend on Wasabi RPC Server.",
            default: "wasabi",
            masked: true,
            pattern: "^[a-zA-Z0-9_]+$",
            "pattern-description":
              "Must be alphanumeric (can contain underscore).",
          },
          password: {
            type: "string",
            nullable: false,
            name: "RPC Password",
            description: "The password for connecting to Wasabi over RPC.",
            warning:
              "You will need to restart all services that depend on Wasabi RPC Server.",
            default: {
              charset: "a-z,2-7",
              len: 20,
            },
            pattern: "^[a-zA-Z0-9_]+$",
            "pattern-description":
              "Must be alphanumeric (can contain underscore).",
            copyable: true,
            masked: true,
          },
          "rpc-tor-address": {
            name: "RPC Tor Address",
            description: "The Tor address of the RPC interface",
            type: "pointer",
            subtype: "package",
            "package-id": "wasabi-webtop",
            target: "tor-address",
            interface: "rpc",
          },
        },
      },
    },
  },
});

export type Config = typeof setConfigMatcher._TYPE;
