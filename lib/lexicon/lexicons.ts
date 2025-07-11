/* eslint-disable @typescript-eslint/no-unused-vars */
import { Lexicons, ValidationError } from "@atproto/lexicon";

import { is$typed, maybe$typed } from "./util";

import type { $Typed } from "./util";
import type { LexiconDoc, ValidationResult } from "@atproto/lexicon";

/**
 * GENERATED CODE - DO NOT MODIFY
 */

export const schemaDict = {
  AppMidnightskyPost: {
    lexicon: 1,
    id: "app.midnightsky.post",
    defs: {
      main: {
        type: "record",
        key: "tid",
        record: {
          type: "object",
          required: ["id", "type"],
          properties: {
            id: {
              type: "string",
              minLength: 1,
              maxLength: 36,
            },
            type: {
              type: "string",
              minLength: 1,
              maxLength: 36,
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>;
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[];
export const lexicons: Lexicons = new Lexicons(schemas);

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>;
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>;
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === "main" ? id : `${id}#${hash}`}" $type property`,
        ),
      };
}

export const ids = {
  AppMidnightskyPost: "app.midnightsky.post",
} as const;
