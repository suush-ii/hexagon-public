import { error, json, type RequestHandler } from '@sveltejs/kit'
import { badwords as badWordsList } from '$lib/server/games/badwords'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

const badWordsSet = new Set(badWordsList)

function getBadWords(text: string): string[] {
	const lowerText = text.toLowerCase()

	const words = lowerText.split(/\s+/)

	return words.filter((word) => badWordsSet.has(word))
}

function getGoodWords(text: string, badWords: string[]): string {
	let censoredText = text

	const sortedBadWords = [...badWords].sort((a, b) => b.length - a.length)

	for (const badWord of sortedBadWords) {
		const regex = new RegExp(badWord, 'gi')

		censoredText = censoredText.replace(regex, (match) => '#'.repeat(match.length))
	}
	return censoredText
}

const formSchema = z.object({
	text: z.string()
})

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData()
	const form = await superValidate(formData, zod(formSchema))

	if (!form.valid) {
		return error(400, { success: false, message: 'Malformed input.' })
	}

	const badWords = getBadWords(form.data.text)

	return json({
		data: {
			white: getGoodWords(form.data.text, badWords),
			black: badWords.join(' ')
		}
	})
}
