import { compat } from "../deps.ts";

export const getConfig = compat.getConfig({
  "title": {
    "type": "string",
    "nullable": false,
    "name": "Webtop Title",
    "description": "This value will be displayed as the title of your browser tab.",
    "default": "Start9 Webtop",
    "pattern": "^[^\\n\"]*$",
    "pattern-description": "Must not contain newline or quote characters.",
    "masked": false,
    "copyable": true
  },
  "username": {
    "type": "string",
    "nullable": false,
    "name": "Username",
    "description": "The username for logging into your Webtop.",
    "default": "webtop",
    "pattern": "^[^\\n\"]*$",
    "pattern-description": "Must not contain newline or quote characters.",
    "masked": false,
    "copyable": true
  },
  "password": {
    "type": "string",
    "name": "Password",
    "description": "The password for logging into your Webtop.",
    "nullable": false,
    "masked": true,
    "default": {
      charset: "a-z,1-9",
      len: 20,
    },
    "pattern": "^[^\\n\"]*$",
    "pattern-description": "Must not contain newline or quote characters.",
    "copyable": true
  }
})

