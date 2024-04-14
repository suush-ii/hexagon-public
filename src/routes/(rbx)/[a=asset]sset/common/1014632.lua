local Ball = script.Parent
local damage = 25

local r = game:service("RunService")
local debris = game:GetService("Debris")

local last_sound_time = r.Stepped:wait()

function onTouched(hit)
	if hit.Parent == nil then return end 
	local now = r.Stepped:wait()
	if (now - last_sound_time > .1) then
		Ball.Boing:play()
		last_sound_time = now
	else
		return
	end

	local humanoid = hit.Parent:FindFirstChild("Humanoid")	
	if humanoid ~=nil then
		tagHumanoid(humanoid)		
		humanoid:TakeDamage(damage)	
		if connection then connection:disconnect() end
	else
		damage = damage / 2
		if damage < 2 then
			if connection then connection:disconnect() end
		end
	end
end

function tagHumanoid(humanoid)	
	local tag = Ball:findFirstChild("creator")
	if tag ~= nil then
		local new_tag = tag:clone()
		new_tag.Parent = humanoid
		debris:AddItem(new_tag, 2)
	end
end


connection = Ball.Touched:connect(onTouched)

t, s = r.Stepped:wait()
d = t + 5.0 - s
while t < d do
	t = r.Stepped:wait()
end

Ball.Parent = nil