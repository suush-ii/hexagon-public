import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url }) => {
	return json([
		{
			Id: 464140,
			Name: 'Game Stuff'
		},
		{
			Id: 464138,
			Name: 'Baseplates'
		},
		{
			Id: 464131,
			Name: 'Weapons'
		},
		{
			Id: 463266,
			Name: 'Vehicles'
		},
		{
			Id: 458339,
			Name: 'Bricks'
		},
		{
			Id: 360380,
			Name: 'Basic Building'
		},
		{
			Id: 360378,
			Name: 'Advanced Building'
		},
		{
			Id: 360375,
			Name: 'House Kit'
		},
		{
			Id: 360372,
			Name: 'House Interior Kit'
		},
		{
			Id: 360371,
			Name: 'Landscape'
		},
		{
			Id: 360369,
			Name: 'Castle Kit'
		},
		{
			Id: 360365,
			Name: 'Castle Interior Kit'
		},
		{
			Id: 360363,
			Name: 'Space Kit'
		},
		{
			Id: 360362,
			Name: 'Fun Machines'
		},
		{
			Id: 360360,
			Name: 'Deadly Machines'
		}
	])
}
