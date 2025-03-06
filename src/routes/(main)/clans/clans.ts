import type { HexagonClans } from '$lib/types'
import { hexagonClans } from '$lib'
import { z } from 'zod'

export const clanDescriptions: Record<HexagonClans, string> = {
	wuff: `My clan is focused on making Hexagon an even better place, it focuses on:

- Improving the economy so that everyone has a chance to make their avator on day one, and so that limiteds can't be very easily hoarded

- Making sure original games get highlighted, something the Labor Collective of Hexagon focuses on aswell, but I also want to help with that.

- Hosting fun events with real Moon prizes so that people are encouraged to be active.

As times progress, the goals of this clan will change, but so will Hexagon, and with each passing step, it will get better. Make sure to join this clan, and you'll have a heavy say in Hexagon's future.`,
	jamrio: `This is the clan of showing off your creativity and hopefully introducing proposals for Hexagon's future! Everyone has a say, everyone is welcome to make a poll no matter your role - we are in this together. We are committed to working with each clan so that unity can prevail.
    Our Focuses

    - Games: They are vital to revivals/private servers to keep engagement up, so we would to promote your creative outlet via featuring unique games and possible moon payments, to those who may want additional incentive.

    - Economy: Making sure everyone is able to express themselves without the limitations of price gouging or hoarding is very core to us. We hope for more social gears and hats to be added, with respect for user-created items in the way they are priced.
`,
	cone: `A clan focused on developers and builders. It is dedicated to showing off your projects and builds. We value developers and show their decent projects publicly. What we consider decent:
	- A game that has modern elements

	- New concepts or a game intended as a puzzle/platformer game (like RAGE GAME)

	- A considerably good game developer
`
}

export const formSchema = z.object({
	clan: z.enum(hexagonClans)
})
