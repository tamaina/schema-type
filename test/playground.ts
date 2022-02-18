import { SchemaType, Packed } from '../index';

/*
 * Simple Schema
 */

const xs = {
	type: 'object',
	nullable: true,
	required: ['a', 'c', 'o'],
	properties: {
		a: {
			type: 'string',
		},
		b: {
			type: 'number',
		},
		c: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					x: {
						type: 'string',
					}
				}
			}
		},
		d: {
			type: 'boolean',
		},
		o: {
			oneOf: [
				{ type: 'string' },
				{ type: 'integer' },
			]
		},
		p: {
			type: 'object',
			allOf: [
				{
					type: 'object',
					required: ['foo'],
					properties: {
						foo: { type: 'string' },
					},
				},
				{
					type: 'object',
					required: ['bar'],
					properties: {
						bar: { type: 'string' },
					},
				}
			],
		},
		q: {
			type: 'object',
			anyOf: [
				{
					type: 'object',
					required: ['foo'],
					properties: {
						foo: { type: 'string' },
					},
				},
				{
					type: 'object',
					required: ['bar'],
					properties: {
						bar: { type: 'string' },
					},
				},
				{
					type: 'object',
					required: ['baz'],
					properties: {
						baz: { type: 'string' },
					},
				}
			],
		},
		r: {
			type: 'array',
			items: {
				oneOf: [
					{
						type: 'object',
						required: ['foo'],
						properties: {
							foo: { type: 'string' },
						},
					},
					{
						type: 'object',
						required: ['bar'],
						properties: {
							bar: { type: 'string' },
						},
					}
				]
			}
		}
	},
} as const;

type X = SchemaType<{}, typeof xs>;

const x: X = {
	a: 'nyan',
	b: 0,
	c: [
		{ x: 'nyan' },
	],
	d: 1,
	o: 'any',
	p: {
		foo: 'nyan',
	},
	q: {
		baz: 'nyan',
	},
	r: [{ foo: 'a' }, { bar: 'b' }],
}

/* 
 * Refs
 */

const rs = {
	type: 'object',
	properties: {
		hoge: {
			type: 'object',
			ref: 'X'
		},
		d: {
			type: 'string',
		}
	},
	required: ['d'],
} as const

const ctx = { X: xs, R: rs };

type R = SchemaType<typeof ctx, typeof rs>;

const r: R = {
	hoge: {
		a: 'nyan',
		b: 0,
		c: [
			{ x: 'nyan' },
		]
	},
	d: 'boo',
}

const pr: Packed<typeof ctx, 'R'> = {
	d: 'string',
}

/* 
 * Circulation Ref
 */

const fs = {
	type: 'object',
	properties: {
		f: {
			type: 'object',
			ref: 'F'
		},
		i: {
			type: 'string',
		}
	},
	required: ['i'],
} as const

const ftx = { F: fs };

type F = SchemaType<typeof ftx, typeof fs>;

const f: F = {
	f: {
		f: {
			i: 'nyan',
		},
		i: 'bar',
	},
	i: 'foo',
}
