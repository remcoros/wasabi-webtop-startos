import { compat, types as T } from "../deps.ts";

export const migration: T.ExpectedExports.migration = compat.migrations
    .fromMapping({}, "1.18.2.1" );
