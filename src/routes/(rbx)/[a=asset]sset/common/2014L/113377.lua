-- BEGIN HEXAGON 2014 ADMIN SCRIPT
-- BY BRANDAN FOR HEXAGON
-- All rights reserved

Players = game:GetService("Players")

HxAdmin = {
	Version = '0.0.1',

	Seperator = "/",

	Admins = {},

	Commands = {
		
	}

}

function HxAdmin.Output(thread, output)
	print(
		string.format("[HxAdmin:%s] %s",
			tostring(thread),
			output)
	)
end

function HxAdmin.Attest(player)
	if not type(player) == "userdata" and player:IsA("Player") then error"Not a player" end

	for _,admin in pairs(HxAdmin.Admins) do
		if admin == player.Name then
			return true
		end
	end

	return false
end

function HxAdmin.Evict(player, reason)
	HxAdmin.Output("Evict", 
		string.format(
			"%s was removed from the server by Muse for %s", 
			tostring(player), tostring(reason)
		)
	)
end

function HxAdmin.ConnectChat(player)
	return player.Chatted:connect(function(con_msg)

	end)
end

Players.PlayerAdded:connect(function(player)
	HxAdmin.ConnectChat(player)
end)

