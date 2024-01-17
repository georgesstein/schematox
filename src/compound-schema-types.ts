import type { BS_Schema, Con_BS_Schema_SubjT } from './base-short-schema-types'
import type {
  BD_Schema,
  Con_BD_Schema_SubjT_P,
  Con_BD_Schema_SubjT_V,
} from './base-detailed-schema-types'

export type BaseSchema = BS_Schema | BD_Schema
export type CompoundSchema = CS_Object | CD_Object | CS_Array | CD_Array
export type Schema = BaseSchema | CompoundSchema

type R<T> =
  | T
  | [T]
  | { type: 'array'; of: T }
  | { type: 'object'; of: T }
  | Record<
      string,
      T | [T] | { type: 'array'; of: T } | { type: 'object'; of: T }
    >

/* ArraySchema */

export type CD_Array<T extends Schema = R<R<R<R<BaseSchema>>>>> = {
  type: 'array'
  of: T

  optional?: boolean
  description?: string
  minLength?: number /* >= */
  maxLength?: number /* <= */
}

export type CS_Array<T extends Schema = R<R<R<R<BaseSchema>>>>> = [T]

/* ObjectSchema */

export type CS_Object<
  T extends string = string,
  U extends Schema = R<R<R<R<BaseSchema>>>>,
> = Record<T, U>

export type CD_Object<
  T extends string = string,
  U extends Schema = R<R<R<R<BaseSchema>>>>,
> = {
  type: 'object'
  of: Record<T, U> | U

  optional?: boolean
  description?: string
}

/* Construct BaseSchema subject type */

export type Con_BaseSchema_SubjT_P<T extends BaseSchema> = T extends BS_Schema
  ? Con_BS_Schema_SubjT<T>
  : T extends BD_Schema
    ? Con_BD_Schema_SubjT_P<T>
    : never

export type Con_BaseSchema_SubjT_V<T extends BaseSchema> = T extends BS_Schema
  ? Con_BS_Schema_SubjT<T>
  : T extends BD_Schema
    ? Con_BD_Schema_SubjT_V<T>
    : never

/* Compound schema optionality extension */

export type ExtWith_CompoundSchemaOptionality<
  T extends { optional?: boolean },
  U,
> = T extends { optional: true } ? U | undefined : U

/* Construct ARRAY schema subject type */

export type Con_CS_Array_SubjT_P<T extends CS_Array> = T extends [infer U]
  ? U extends BaseSchema
    ? Array<NonNullable<Con_BaseSchema_SubjT_P<U>>>
    : never
  : never

export type Con_CS_Array_SubjT_V<T extends CS_Array> = T extends [infer U]
  ? U extends BaseSchema
    ? Array<Con_BaseSchema_SubjT_V<U>>
    : U extends CS_Array
      ? Array<Con_CS_Array_SubjT_V<U>>
      : U extends CD_Array
        ? Array<Con_CD_Array_SubjT_V<U>>
        : never
  : never

export type Con_CD_Array_SubjT_P<T extends CD_Array> =
  ExtWith_CompoundSchemaOptionality<
    T,
    T extends { of: infer U }
      ? U extends BaseSchema
        ? Array<NonNullable<Con_BaseSchema_SubjT_P<U>>>
        : never
      : never
  >

export type Con_CD_Array_SubjT_V<T extends CD_Array> =
  ExtWith_CompoundSchemaOptionality<
    T,
    T extends { of: infer U }
      ? U extends BaseSchema
        ? Array<Con_BaseSchema_SubjT_V<U>>
        : U extends CD_Array
          ? Array<Con_CD_Array_SubjT_V<U>>
          : U extends CS_Array
            ? Array<Con_CS_Array_SubjT_V<U>>
            : never
      : never
  >

/* Construct ObjectSchema subject type */

// FIXME: should work as expected only if we add `& {}`
//        which is currently forbidden by our linter
export type Prettify_ObjectSchema_SubjT<T> = {
  [k in keyof T]: T[k]
}

export type Con_CS_Object_SubjT_V<T extends CS_Object> = {
  [k in keyof T]: T[k] extends BaseSchema
    ? Con_BaseSchema_SubjT_V<T[k]>
    : T[k] extends CS_Object
      ? Con_CS_Object_SubjT_V<T[k]>
      : T[k] extends CS_Array
        ? Con_CS_Array_SubjT_V<T[k]>
        : T[k] extends CD_Array
          ? Con_CD_Array_SubjT_V<T[k]>
          : never
}

// export type CompoundSchema = CS_Object | CD_Object | CS_Array | CD_Array

export type Con_CD_Object_SubjT_V<T extends CD_Object> = T extends {
  of: infer U
}
  ? {
      [k in keyof U]: U[k] extends BaseSchema
        ? Con_BaseSchema_SubjT_V<U[k]>
        : U[k] extends CD_Object
          ? Con_CD_Object_SubjT_V<U[k]>
          : U[k] extends CS_Object
            ? Con_CS_Object_SubjT_V<U[k]>
            : never
    }
  : never

/* Construct Schema subject type (TBD) */