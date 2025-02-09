import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return json({
		data: [
			'38335c15e9fe20c4b736ea8b939135df',
			'7bdfdd1896e0a2c0d32e2d5fe90bf78a',
			'4c17136f028ccdd610108fa1209b117e',
			'a8c849c7dfed2e02969fd55301be7374',
			'8e246cbf18054169c48d7f2c8e844230',
			'42bd28bb0701e1a2a870a4d38b0b2955'
		]
	})
}
