r = game:service("RunService")

shaft = script.Parent
position = shaft.Position

script.Parent.Explosion.PlayOnRemove = true -- play explosion sound when projectile removed from game

function fly()
	direction = shaft.CFrame.lookVector 
	position = position + direction
	error = position - shaft.Position
	shaft.Velocity = 7*error
end

function blow()
	swoosh:stop()
	explosion = Instance.new("Explosion")
	explosion.Position = shaft.Position


	-- find instigator tag
	local creator = script.Parent:findFirstChild("creator")
	if creator ~= nil then
		explosion.Hit:connect(function(part, distance)  onPlayerBlownUp(part, distance, creator) end)
	end

	explosion.Parent = game.Workspace
	connection:disconnect()
	wait(.1)
	shaft:remove()
end

function onPlayerBlownUp(part, distance, creator)
	
	if part.Name == "Head" then
	
		local humanoid = part.Parent.Humanoid
		tagHumanoid(humanoid, creator)
	end
end

function tagHumanoid(humanoid, creator)
	-- tag does not need to expire iff all explosions lethal
	
	if creator ~= nil then
		local new_tag = creator:clone()
		new_tag.Parent = humanoid
		
	end
end

function untagHumanoid(humanoid)
	if humanoid ~= nil then
		local tag = humanoid:findFirstChild("creator")
		if tag ~= nil then
		
			tag.Parent = nil
		end
	end
end

t, s = r.Stepped:wait()

swoosh = script.Parent.Swoosh
swoosh:play()

d = t + 10.0 - s
connection = shaft.Touched:connect(blow)

while t < d do
	fly()
	t = r.Stepped:wait()
end

-- at max range
script.Parent.Explosion.PlayOnRemove = false
swoosh:stop()
shaft:remove()
