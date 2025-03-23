import type { PageServerLoad } from './$types'
import {
	assetTable,
	gamesTable,
	placesTable,
	recentlyPlayedTable,
	relationsTable,
	usersTable
} from '$lib/server/schema'
import { db } from '$src/lib/server/db'
import { and, count, desc, eq } from 'drizzle-orm'
import { getUserState } from '$lib/server/userState'
import { imageSql } from '$lib/server/games/getImage'
import { alias } from 'drizzle-orm/pg-core'
import { activeSql } from '$lib/server/games/activeSql'
import { error } from '@sveltejs/kit'

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
	let recentlyPlayed = await db
		.select({
			active: activeSql,
			icon: { moderationstate: assetTable.moderationstate, simpleasseturl: imageSql },
			place: {
				placeid: placesTable.placeid,
				placename: placesTable.placename
			}
		})
		.from(recentlyPlayedTable)
		.innerJoin(gamesTable, eq(gamesTable.universeid, recentlyPlayedTable.gameid))
		.leftJoin(assetTable, eq(assetTable.assetid, gamesTable.iconid))
		.innerJoin(
			placesTable,
			and(eq(placesTable.universeid, gamesTable.universeid), eq(placesTable.startplace, true))
		)
		.where(eq(recentlyPlayedTable.userid, locals.user.userid))
		.limit(9)
		.orderBy(desc(recentlyPlayedTable.time))

	const friendCount = await db
		.select({ count: count() })
		.from(relationsTable)
		.where(and(eq(relationsTable.recipient, locals.user.userid), eq(relationsTable.type, 'friend')))
		.limit(1)

	const sender = alias(usersTable, 'sender')

	const friendMap = await db
		.select({
			username: sender.username,
			userid: sender.userid,
			lastactivetime: sender.lastactivetime,
			activegame: sender.activegame,
			studiopresencelocation: sender.studiopresencelocation,
			studiopresenceping: sender.studiopresenceping,
			gamepresenceping: sender.gamepresenceping
		})
		.from(usersTable)
		.innerJoin(
			relationsTable,
			and(eq(relationsTable.type, 'friend'), eq(relationsTable.recipient, locals.user.userid))
		)
		.innerJoin(sender, eq(sender.userid, relationsTable.sender))
		.where(eq(usersTable.userid, locals.user.userid))
		.limit(9)
		.orderBy(desc(sender.lastactivetime), desc(sender.activegame))

	const friends = friendMap.map((request) => {
		const status = getUserState(
			request.lastactivetime,
			request.activegame,
			request.studiopresencelocation,
			request.studiopresenceping,
			request.gamepresenceping
		)
		return { ...request, status }
	})

	const user = await db.query.usersTable.findFirst({
		columns: {
			username: true,
			userid: true,
			lastactivetime: true,
			joindate: true,
			activegame: true,
			role: true,
			blurb: true,
			sitebadges: true,
			wipeouts: true,
			knockouts: true,
			studiopresencelocation: true,
			studiopresenceping: true,
			registeredclan: true,
			gamepresenceping: true
		},
		where: eq(usersTable.userid, locals.user.userid)
	})

	if (!user) {
		return error(404, { success: false, message: 'User not found' })
	}

	const status = getUserState(
		user.lastactivetime,
		user.activegame,
		user.studiopresencelocation,
		user.studiopresenceping,
		user.gamepresenceping
	)

	return {
		welcomeMessage: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
		recentlyPlayed,
		friendCount: friendCount[0].count,
		friends,
		status
	}
}
