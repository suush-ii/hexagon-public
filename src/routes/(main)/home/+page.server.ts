import type { PageServerLoad } from './$types'
import { placesTable, recentlyPlayedTable, relationsTable, usersTable } from '$lib/server/schema'
import { db } from '$src/lib/server/db'
import { and, count, desc, eq } from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { getUserState } from '$lib/server/userState'
const welcomeMessages = [
	'Welkom',
	'Mirëseerdhët',
	'እንኳን ደህና መጣህ',
	'مرحبا',
	'ողջույն',
	'xoş',
	'Ongi etorri',
	'жаданы',
	'স্বাগত',
	'Dobrodošli',
	'Добре дошли',
	'Benvinguda',
	'歡迎',
	'Benvenuti',
	'Dobrodošli',
	'Vítejte',
	'Velkommen',
	'Welkom',
	'Welcome',
	'Bonvenon',
	'Teretulnud',
	'Maligayang pagdating',
	'Tervetuloa',
	'Bienvenue',
	'Wolkom',
	'Benvido',
	'კეთილი',
	'Willkommen',
	'καλωσόρισμα',
	'સ્વાગત',
	'Akeyi',
	'Barka',
	'ברוך הבא',
	'स्वागत',
	'Zoo siab txais tos',
	'Üdvözöljük',
	'Velkomin',
	'Namasté',
	'Selamat datang',
	'Fáilte',
	'Benvenuto',
	'ようこそ',
	'ಸ್ವಾಗತ',
	'Қош келдіңіздер',
	'សូមស្វាគមន៍',
	'환영',
	'Bixêrhatin',
	'Cаламдашуу',
	'ຍິນດີຕ້ອນຮັບ',
	'Gratissimum',
	'Esi gaidīts',
	'Sveiki atvykę',
	'Wëllkomm',
	'Добредојдовте',
	'Selamat datang',
	'സ്വാഗതം',
	'Merħba',
	'Nau mai',
	'आपले स्वागत आहे',
	'тавтай морилно уу',
	'ကြိုဆိုပါတယ်',
	'स्वागत',
	'Velkommen',
	'ښه راغلاست',
	'خوش آمد',
	'Witaj',
	'Bem-vindo',
	'ਸੁਆਗਤ ਹੈ',
	'Bun venit',
	'добро пожаловать',
	'Taliga',
	'Fàilte',
	'добродошао',
	'Amohelehile',
	'Kugashira',
	'ڀلي ڪري آيا',
	'ඔබ සාදරයෙන් පිළිගනිමු',
	'Vitajte',
	'Dobrodošli',
	'Bienvenido',
	'Wilujeung sumping',
	'Karibu',
	'Välkommen',
	'Хуш омадед',
	'வரவேற்கிறோம்',
	'స్వాగతం',
	'ยินดีต้อนรับ',
	'Hoşgeldin',
	'Ласкаво просимо',
	'آمدید',
	'Xush kelibsiz',
	'Chào mừng bạn',
	'Croeso',
	'באַגריסן',
	'Siyakwamukela'
]

export const load: PageServerLoad = async ({ locals }) => {
	let recentlyPlayed = await db.query.recentlyPlayedTable.findMany({
		where: eq(recentlyPlayedTable.userid, locals.user.userid),
		orderBy: desc(recentlyPlayedTable.time),
		limit: 9,
		columns: {},
		with: {
			game: {
				columns: {
					gamename: true,
					active: true,
					iconid: true
				},
				with: {
					places: {
						where: eq(placesTable.startplace, true),
						limit: 1,
						columns: {
							placeid: true
						}
					},
					icon: {
						columns: {
							simpleasseturl: true,
							moderationstate: true
						}
					}
				}
			}
		}
	})

	recentlyPlayed = recentlyPlayed.map((game) => {
		// strip the asseturl from the client if not approved
		if (game.game.icon && game.game.icon.moderationstate !== 'approved') {
			game.game.icon.simpleasseturl = null
		}
		return game
	})

	const friendCount = await db
		.select({ count: count() })
		.from(relationsTable)
		.where(and(eq(relationsTable.recipient, locals.user.userid), eq(relationsTable.type, 'friend')))
		.limit(1)

	const user = await db.query.usersTable.findFirst({
		columns: {},
		where: eq(usersTable.userid, locals.user.userid),
		with: {
			received: {
				columns: {},
				with: {
					sender: {
						columns: {
							username: true,
							userid: true,
							lastactivetime: true,
							activegame: true
						}
					}
				},
				where: eq(relationsTable.type, 'friend'),
				limit: 9,
				orderBy: desc(relationsTable.time)
			}
		}
	})

	if (!user) {
		error(404, { success: false, message: 'User not found!' })
	}

	const friends = user.received.map((request) => {
		const status = getUserState(request.sender.lastactivetime, request.sender.activegame)
		return { ...request, status }
	})

	return {
		welcomeMessage: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
		recentlyPlayed,
		friendCount: friendCount[0].count,
		friends
	}
}
