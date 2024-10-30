export const categories = [
	{ value: 'all', label: 'All Categories' },
	{
		value: '',
		label: 'Featured',
		types: [
			{ value: '', label: 'All Featured Items' },
			{ value: 'hats', label: 'Featured Hats' },
			{ value: 'gears', label: 'Featured Gear' },
			{ value: 'faces', label: 'Featured Faces' },
			{ value: 'packages', label: 'Featured Packages' }
		]
	},
	{
		value: 'collectibles',
		label: 'Collectibles',
		types: [
			{ value: 'collectibles', label: 'All Collectibles' },
			{ value: 'collectiblefaces', label: 'Collectible Faces' },
			{ value: 'collectiblehats', label: 'Collectibles Hats' },
			{ value: 'collectiblegears', label: 'Collectibles Gear' }
		]
	},
	{
		value: 'clothing',
		label: 'Clothing',
		types: [
			{ value: 'clothing', label: 'All Clothing' },
			{ value: 'hats', label: 'Hats' },
			{ value: 'shirts', label: 'Shirts' },
			{ value: 't-shirts', label: 'T-Shirts' },
			{ value: 'pants', label: 'Pants' },
			{ value: 'packages', label: 'Packages' }
		]
	},
	{
		value: 'bodyparts',
		label: 'Body Parts',
		types: [
			{ value: 'bodyparts', label: 'All Body Parts' },
			{ value: 'heads', label: 'Heads' },
			{ value: 'faces', label: 'Faces' },
			{ value: 'packages', label: 'Packages' }
		]
	},
	{
		value: 'gears',
		label: 'Gear',
		types: [
			{ value: 'gears', label: 'All Gear' },
			{ value: 'Melee weapons', label: 'Melee Weapon' },
			{ value: 'Ranged weapons', label: 'Ranged Weapon' },
			{ value: 'Explosives', label: 'Explosive' },
			{ value: 'Navigation enhancers', label: 'Navigation Enhancer' },
			{ value: 'Musical instruments', label: 'Musical Instrument' },
			{ value: 'Social items', label: 'Social Item' },
			{ value: 'Building tools', label: 'Building Tool' },
			{ value: 'Personal transport', label: 'Personal Transport' }
		]
	}
]
