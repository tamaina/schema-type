export type Refs = { [x: string]: { properties?: Obj<Refs>; oneOf?: ReadonlyArray<Schema<Refs>>; allOf?: ReadonlyArray<Schema<Refs>> } };

export type Packed<Ctx extends Refs, x extends keyof Ctx> = SchemaTypeDef<Ctx, Ctx[x]>;

export type TypeStringef = 'null' | 'boolean' | 'integer' | 'number' | 'string' | 'array' | 'object' | 'any';

export type StringDefToType<T extends TypeStringef> =
	T extends 'null' ? null :
	T extends 'boolean' ? boolean :
	T extends 'integer' ? number :
	T extends 'number' ? number :
	T extends 'string' ? string | Date :
	T extends 'array' ? ReadonlyArray<any> :
	T extends 'object' ? Record<string, any> :
	any;

// https://swagger.io/specification/?sbsearch=optional#schema-object
export type OfSchema<Ctx extends Refs> = {
	readonly anyOf?: ReadonlyArray<Schema<Ctx>>;
	readonly oneOf?: ReadonlyArray<Schema<Ctx>>;
	readonly allOf?: ReadonlyArray<Schema<Ctx>>;
}

export interface Schema<Ctx extends Refs> extends OfSchema<Ctx> {
	readonly type?: TypeStringef;
	readonly nullable?: boolean;
	readonly optional?: boolean;
	readonly items?: Schema<Ctx>;
	readonly properties?: Obj<Ctx>;
	// @ts-ignore
	readonly required?: ReadonlyArray<keyof this['properties']>;
	readonly description?: string;
	readonly example?: any;
	readonly format?: string;
	readonly ref?: keyof Ctx;
	readonly enum?: ReadonlyArray<string>;
	// @ts-ignore
	readonly default?: (this['type'] extends TypeStringef ? StringDefToType<this['type']> : any) | null;
	readonly maxLength?: number;
	readonly minLength?: number;
}

type OptionalPropertyNames<Ctx extends Refs, T extends Obj<Ctx>> = {
	[K in keyof T]: T[K]['optional'] extends true ? K : never
}[keyof T];

type NonOptionalPropertyNames<Ctx extends Refs, T extends Obj<Ctx>> = {
	[K in keyof T]: T[K]['optional'] extends false ? K : never;
}[keyof T];

type DefaultPropertyNames<Ctx extends Refs, T extends Obj<Ctx>> = {
	[K in keyof T]: T[K]['default'] extends null ? K :
	T[K]['default'] extends string ? K :
	T[K]['default'] extends number ? K :
	T[K]['default'] extends boolean ? K :
	T[K]['default'] extends Record<string, unknown> ? K :
	never
}[keyof T];

export type Obj<Ctx extends Refs> = Record<string, Schema<Ctx>>;

export type ObjType<Ctx extends Refs, s extends Obj<Ctx>, RequiredProps extends ReadonlyArray<string>> =
	{ -readonly [P in keyof s]?: SchemaType<Ctx, s[P]> } &
	{ -readonly [P in OptionalPropertyNames<Ctx, s>]?: SchemaType<Ctx, s[P]> } &
	{ -readonly [P in RequiredProps[number]]: SchemaType<Ctx, s[P]> } &
	{ -readonly [P in NonOptionalPropertyNames<Ctx, s>]: SchemaType<Ctx, s[P]> } &
	{ -readonly [P in DefaultPropertyNames<Ctx, s>]: SchemaType<Ctx, s[P]> };

type NullOrUndefined<Ctx extends Refs, p extends Schema<Ctx>, T> =
	p['nullable'] extends true
	? p['optional'] extends true
	? (T | null | undefined)
	: (T | null)
	: p['optional'] extends true
	? (T | undefined)
	: T;

// 共用体型を交差型にする型 https://stackoverflow.com/questions/54938141/typescript-convert-union-to-intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// https://github.com/misskey-dev/misskey/pull/8144#discussion_r785287552
// 単純にSchemaTypeDef<X>で判定するだけではダメ
type UnionSchemaType<Ctx extends Refs, a extends readonly any[], X extends Schema<Ctx> = a[number]> = X extends any ? SchemaType<Ctx, X> : never;
type ArrayUnion<T> = T extends any ? Array<T> : never;

export type SchemaTypeDef<Ctx extends Refs, p extends Schema<Ctx>> =
	p['type'] extends 'null' ? null :
	p['type'] extends 'integer' ? number :
	p['type'] extends 'number' ? number :
	p['type'] extends 'string' ? (
		p['enum'] extends readonly string[] ?
		p['enum'][number] :
		p['format'] extends 'date-time' ? string : // Dateにする？？
		string
	) :
	p['type'] extends 'boolean' ? boolean :
	p['type'] extends 'object' ? (
		p['ref'] extends keyof Ctx ? Packed<Ctx, p['ref']> :
		p['properties'] extends NonNullable<Obj<Ctx>> ? ObjType<Ctx, p['properties'], NonNullable<p['required']>> :
		p['anyOf'] extends ReadonlyArray<Schema<Ctx>> ? UnionSchemaType<Ctx, p['anyOf']> & Partial<UnionToIntersection<UnionSchemaType<Ctx, p['anyOf']>>> :
		p['allOf'] extends ReadonlyArray<Schema<Ctx>> ? UnionToIntersection<UnionSchemaType<Ctx, p['allOf']>> :
		any
	) :
	p['type'] extends 'array' ? (
		p['items'] extends OfSchema<Ctx> ? (
			p['items']['anyOf'] extends ReadonlyArray<Schema<Ctx>> ? UnionSchemaType<Ctx, NonNullable<p['items']['anyOf']>>[] :
			p['items']['oneOf'] extends ReadonlyArray<Schema<Ctx>> ? ArrayUnion<UnionSchemaType<Ctx, NonNullable<p['items']['oneOf']>>> :
			p['items']['allOf'] extends ReadonlyArray<Schema<Ctx>> ? UnionToIntersection<UnionSchemaType<Ctx, NonNullable<p['items']['allOf']>>>[] :
			never
		) :
		// @ts-ignore
		p['items'] extends Schema<Ctx> ? SchemaTypeDef<Ctx, p['items']>[] :
		any[]
	) :
	p['oneOf'] extends ReadonlyArray<Schema<Ctx>> ? UnionSchemaType<Ctx, p['oneOf']> :
	any;

export type SchemaType<Ctx extends Refs, p extends Schema<Ctx>> = NullOrUndefined<Ctx, p, SchemaTypeDef<Ctx, p>>;
