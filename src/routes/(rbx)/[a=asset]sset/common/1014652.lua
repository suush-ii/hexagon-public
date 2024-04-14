local debris = game:service("Debris")
pellet = script.Parent
damage = 8

function onTouched(hit)
	humanoid = hit.Parent:findFirstChild("Humanoid")
	if humanoid~=nil then
		tagHumanoid(humanoid)
		humanoid:TakeDamage(damage)
	else
		damage = damage / 2
		if damage < 1 then
			connection:disconnect()
			pellet.Parent = nil
		end
	end
end

function tagHumanoid(humanoid)
	-- todo: make tag expire
	local tag = pellet:findFirstChild("creator")
	if tag ~= nil then
		-- kill all other tags
		while(humanoid:findFirstChild("creator") ~= nil) do
			humanoid:findFirstChild("creator").Parent = nil
		end

		local new_tag = tag:clone()
		new_tag.Parent = humanoid
		debris:AddItem(new_tag, 1)
	end
end

connection = pellet.Touched:connect(onTouched)

r = game:service("RunService")
t, s = r.Stepped:wait()
d = t + 2.0 - s
while t < d do
	t = r.Stepped:wait()
end

pellet.Parent = nil
