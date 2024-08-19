import type { HexagonBadges } from '$lib/types'

export const badgeDescriptions: Record<HexagonBadges, string> = {
	admin:
		"This badge identifies an account as belonging to a Hexagon administrator. Only official Hexagon administrators will possess this badge. If someone claims to be an admin, but does not have this badge, they are potentially trying to mislead you. If this happens, please report abuse and we will delete the imposter's account.",
	veteran:
		'This decoration is awarded to all citizens who have played Hexagon for at least a year. It recognizes stalwart community members who have stuck with us over countless releases and have helped shape Hexagon into the game that it is today. These medalists are the true steel, the core of the Hexagonian history ... and its future.',
	homestead:
		'The homestead badge is earned by having your personal place visited 100 times. Players who achieve this have demonstrated their ability to build cool things that other Hexagonians were interested enough in to check out. Get a jump-start on earning this reward by inviting people to come visit your place.',
	bricksmith:
		'The Bricksmith badge is earned by having a popular personal place. Once your place has been visited 1000 times, you will receive this award. Hexagonians with Bricksmith badges are accomplished builders who were able to create a place that people wanted to explore a thousand times. They no doubt know a thing or two about putting bricks together.',
	friendship:
		'This badge is given to players who have embraced the Hexagon community and have made at least 20 friends. People who have this badge are good people to know and can probably help you out if you are having trouble.',
	'combat initiation':
		'This badge is given to any player who has proven his or her combat abilities by accumulating 10 victories in battle. Players who have this badge are not complete newbies and probably know how to handle their weapons.',
	warrior:
		'This badge is given to the warriors of Hexagonia, who have time and time again overwhelmed their foes in battle. To earn this badge, you must rack up 100 knockouts. Anyone with this badge knows what to do in a fight!',
	bloxxer:
		'Anyone who has earned this badge is a very dangerous player indeed. Those Hexagonians who excel at combat can one day hope to achieve this honor, the Bloxxer Badge. It is given to the warrior who has bloxxed at least 250 enemies and who has tasted victory more times than he or she has suffered defeat. Salute!'
}
