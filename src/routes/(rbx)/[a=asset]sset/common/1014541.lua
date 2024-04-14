ball = script.Parent
damage = 2

function onTouched(hit)
	local humanoid = hit.Parent:findFirstChild("Humanoid")
	
		
	if hit:getMass() < 1.2 * 200 then
		hit.BrickColor = ball.BrickColor
	end
	-- make a splat
	for i=1,3 do
		local s = Instance.new("Part")
		s.Shape = 1 -- block
		s.formFactor = 2 -- plate
		s.Size = Vector3.new(1,.4,1)
		s.BrickColor = ball.BrickColor
		local v = Vector3.new(math.random(-1,1), math.random(0,1), math.random(-1,1))
		s.Velocity = 15 * v
		s.CFrame = CFrame.new(ball.Position + v, v)
		ball.BrickCleanup:clone().Parent = s
		s.BrickCleanup.Disabled = false
		s.Parent = game.Workspace
		
	end
	

	if humanoid ~= nil then
		tagHumanoid(humanoid)
		humanoid:TakeDamage(damage)
		wait(2)
		untagHumanoid(humanoid)
	end

	connection:disconnect()
	ball.Parent = nil
end

function tagHumanoid(humanoid)
	-- todo: make tag expire
	local tag = ball:findFirstChild("creator")
	if tag ~= nil then
		local new_tag = tag:clone()
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

connection = ball.Touched:connect(onTouched)

wait(8)
ball.Parent = nil
