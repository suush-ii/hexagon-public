-- Start Game Script Arguments
--local placeId, port, gameId, sleeptime, access, url, killID, deathID, timeout, machineAddress, gsmInterval, gsmUrl, maxPlayers, maxSlotsUpperLimit, maxSlotsLowerLimit, maxGameInstances, injectScriptAssetID, apiKey, libraryRegistrationScriptAssetID = ...

local sleeptime, url, timeout = 0, "http://www.roblox.com", 0

local access, placeId, port, JobId, maxPlayers = {1}

local logs = {}

function RemoveTableDupes(tab)
	local hash = {}
	local res = {}
	for _,v in ipairs(tab) do
		if (not hash[v]) then
			res[#res+1] = v
			hash[v] = true
		end
	end
	return res
end
--defining jobid here is a hack for now


-- REQUIRES: StartGanmeSharedArgs.txt
-- REQUIRES: MonitorGameStatus.txt

------------------- UTILITY FUNCTIONS --------------------------
local ok, err = ypcall(function()
local cdnSuccess = 0
local cdnFailure = 0

function reportCdn(blocking)
	pcall(function()
		local newCdnSuccess = settings().Diagnostics.CdnSuccessCount
		local newCdnFailure = settings().Diagnostics.CdnFailureCount
		local successDelta = newCdnSuccess - cdnSuccess
		local failureDelta = newCdnFailure - cdnFailure
		cdnSuccess = newCdnSuccess
		cdnFailure = newCdnFailure
		if successDelta > 0 or failureDelta > 0 then
			--game:HttpGet(url .. "/Game/Cdn.ashx?source=server&success=" .. successDelta .. "&failure=" .. failureDelta, blocking)
		end
	end)
end

function waitForChild(parent, childName)
	while true do
		local child = parent:findFirstChild(childName)
		if child then
			return child
		end
		parent.ChildAdded:wait()
	end
end

-- returns the player object that killed this humanoid
-- returns nil if the killer is no longer in the game
function getKillerOfHumanoidIfStillInGame(humanoid)

	-- check for kill tag on humanoid - may be more than one - todo: deal with this
	local tag = humanoid:findFirstChild("creator")

	-- find player with name on tag
	if tag then
		local killer = tag.Value
		if killer.Parent then -- killer still in game
			return killer
		end
	end

	return nil
end

-- send kill and death stats when a player dies
function onDied(victim, humanoid)
	local killer = getKillerOfHumanoidIfStillInGame(humanoid)
	local victorId = 0
	if killer then
		victorId = killer.userId
		print("STAT: kill by " .. victorId .. " of " .. victim.userId)
		game:HttpPost(url .. "/Game/Knockouts.ashx?UserID=" .. victorId .. "&" .. access, "")
	end
	print("STAT: death of " .. victim.userId .. " by " .. victorId)
	game:HttpPost(url .. "/Game/Wipeouts.ashx?UserID=" .. victim.userId .. "&" .. access, "")
end

-----------------------------------END UTILITY FUNCTIONS -------------------------

-----------------------------------"CUSTOM" SHARED CODE----------------------------------

pcall(function() settings().Network.UseInstancePacketCache = true end)
pcall(function() settings().Network.UsePhysicsPacketCache = true end)
--pcall(function() settings()["Task Scheduler"].PriorityMethod = Enum.PriorityMethod.FIFO end)
pcall(function() settings()["Task Scheduler"].PriorityMethod = Enum.PriorityMethod.AccumulatedError end)

--settings().Network.PhysicsSend = 1 -- 1==RoundRobin
--settings().Network.PhysicsSend = Enum.PhysicsSendMethod.ErrorComputation2
settings().Network.PhysicsSend = Enum.PhysicsSendMethod.TopNErrors
settings().Network.ExperimentalPhysicsEnabled = true
settings().Network.WaitingForCharacterLogRate = 100
pcall(function() settings().Diagnostics:LegacyScriptMode() end)

-----------------------------------START GAME SHARED SCRIPT------------------------------

local assetId = placeId -- might be able to remove this now

local scriptContext = game:GetService('ScriptContext')
pcall(function() scriptContext:AddStarterScript(libraryRegistrationScriptAssetID) end)
scriptContext.ScriptsDisabled = true

game:SetPlaceID(assetId, true)
game:GetService("ChangeHistoryService"):SetEnabled(false)

-- establish this peer as the Server
local ns = game:GetService("NetworkServer")

if url~=nil then
	pcall(function() game:GetService("Players"):SetAbuseReportUrl(url .. "/AbuseReport/InGameChatHandler.ashx") end)
	pcall(function() game:GetService("ScriptInformationProvider"):SetAssetUrl(url .. "/Asset/") end)
	pcall(function() game:GetService("ContentProvider"):SetBaseUrl(url .. "/") end)
	--pcall(function() game:GetService("Players"):SetChatFilterUrl(url .. "/Game/ChatFilter.ashx") end)

	game:GetService("BadgeService"):SetPlaceId(placeId)
	if access~=nil then
		game:GetService("BadgeService"):SetAwardBadgeUrl(url .. "/game/Badge/AwardBadge.ashx?UserID=%d&BadgeID=%d&PlaceID=%d&" .. access)
		game:GetService("BadgeService"):SetHasBadgeUrl(url .. "/Game/Badge/HasBadge.ashx?UserID=%d&BadgeID=%d&" .. access)
		game:GetService("BadgeService"):SetIsBadgeDisabledUrl(url .. "/Game/Badge/IsBadgeDisabled.ashx?BadgeID=%d&PlaceID=%d&" .. access)

		game:GetService("FriendService"):SetMakeFriendUrl(url .. "/Game/CreateFriend?firstUserId=%d&secondUserId=%d")
		game:GetService("FriendService"):SetBreakFriendUrl(url .. "/Game/BreakFriend?firstUserId=%d&secondUserId=%d")
		game:GetService("FriendService"):SetGetFriendsUrl(url .. "/Game/AreFriends?userId=%d")
	end
	game:GetService("BadgeService"):SetIsBadgeLegalUrl("")
	game:GetService("InsertService"):SetBaseSetsUrl(url .. "/Game/Tools/InsertAsset.ashx?nsets=10&type=base")
	game:GetService("InsertService"):SetUserSetsUrl(url .. "/Game/Tools/InsertAsset.ashx?nsets=20&type=user&userid=%d")
	game:GetService("InsertService"):SetCollectionUrl(url .. "/Game/Tools/InsertAsset.ashx?sid=%d")
	game:GetService("InsertService"):SetAssetUrl(url .. "/Asset/?id=%d")
	game:GetService("InsertService"):SetAssetVersionUrl(url .. "/Asset/?assetversionid=%d")
	game:GetService("InsertService"):SetTrustLevel(0) -- i dont know what this does... it just works...

	pcall(function() loadfile(url .. "/Game/LoadPlaceInfo.ashx?PlaceId=" .. placeId)() end)

	pcall(function()
				if access then
					loadfile(url .. "/Game/PlaceSpecificScript.ashx?PlaceId=" .. placeId .. "&" .. access)()
				end
			end)
end

pcall(function() game:GetService("NetworkServer"):SetIsPlayerAuthenticationRequired(false) end)
settings().Diagnostics.LuaRamLimit = 0
--settings().Network:SetThroughputSensitivity(0.08, 0.01)
--settings().Network.SendRate = 35
--settings().Network.PhysicsSend = 0  -- 1==RoundRobin

--shared["__time"] = 0
--game:GetService("RunService").Stepped:connect(function (time) shared["__time"] = time end)




if placeId~=nil --[[ and killID~=nil and deathID~=nil --]] and url~=nil then
	-- listen for the death of a Player
	function createDeathMonitor(player)
		-- we don't need to clean up old monitors or connections since the Character will be destroyed soon
		if player.Character then
			local humanoid = waitForChild(player.Character, "Humanoid")
			humanoid.Died:connect(
				function ()
					onDied(player, humanoid)
				end
			)
		end
	end

	-- listen to all Players' Characters
	game:GetService("Players").ChildAdded:connect(
		function (player)
			createDeathMonitor(player)
			player.Changed:connect(
				function (property)
					if property=="Character" then
						createDeathMonitor(player)
					end
				end
			)
		end
	)
end

game:GetService("Players").PlayerAdded:connect(function(player)
	print("Player " .. player.userId .. " added")

	
end)
local HttpService = game:GetService("HttpService")

local function check()
	if #game:GetService("Players"):GetPlayers() < 1 then
		-- less than one player is in the game so lets shut down
		local arguments = {
			["jobid"] = JobId
		}
		game:HttpPostAsync(url .. "/updatejob/closejob?" .. access,HttpService:JSONEncode(arguments),"application/json")
	end
end


game:GetService("Players").PlayerRemoving:connect(function(player)
	print("Player " .. player.userId .. " leaving")

	if url and access and placeId and player and player.userId then
		game:HttpPost(url .. "/game/ClientPresence.ashx?action=disconnect&" .. access .. "&PlaceID=" .. placeId .. "&JobID=" .. JobId .. "&UserID=" .. player.userId, "")
		wait(5)
		check()

	end
end)

spawn(function()
    -- if a player doesn't join in 60 seconds because of failed job or they didn't join close the job
	wait(60)
	check()
end)

if placeId~=nil and url~=nil then
	-- yield so that file load happens in the heartbeat thread
	wait()

	-- load the game
	local success, result = pcall(function()
		game:Load(url .. "/asset/?id=" .. placeId .. "&" .. access)
	end)

	if not success then
    	local msg = Instance.new("Message", workspace)
    	msg.Text = "place failed to load."
	end

	print("DataModel Loading http://www.hexagon.pw/asset/?id=" .. placeId)
end


local function char_to_hex(c)
    return string.format("%%%02X", string.byte(c))
end

local function urlencode(url)
    if url == nil then
        return
    end
    url = url:gsub("\n", "\r\n")
    url = url:gsub("([^%w%-%.%_%~%!%*%'%(%)])", char_to_hex)
    return url
end

local function pullUserLog(player)
	logs["" .. player.userId] = logs["" .. player.userId] or {}
	logs["" .. player.userId] = RemoveTableDupes(logs["" .. player.userId])

	return logs["" .. player.userId]
end


local function logEvent(player, item, event)
	local player_log = pullUserLog(player)
	event = "[INSTANCE] "..event
	pcall(function()
		if item.Parent ~= nil then
			event = string.format("%s Parent: %s", event, tostring(item.Parent))
		
			if item.Parent.Parent ~= nil then
				event = string.format("%s Parent.Parent: %s", event, tostring(item.Parent.Parent))
			end
		end
	end)

    table.insert(player_log, event)
end

local function logChatEvent(player, message)
	pcall(function()
		local player_log = pullUserLog(player)
		table.insert(
			player_log,
			("[CHAT] %s: %s"):format(player.Name, message) 
	)
	end)
end

local function sendLogs(blocking)
	pcall(function()
		game:HttpPost(url .. "/game/Log.ashx?" .. "jobId=" .. JobId .. "&placeId=" .. placeId .. "&" .. access, HttpService:JSONEncode(logs), blocking, "application/json")
	end)
end

local function presenceCheck(blocking)
	pcall(function()
		local response = game:HttpPost(url .. "/game/ServerPresence.ashx?" .. "&jobId=" .. JobId .. "&" .. access, "", blocking)

		local data = HttpService:JSONDecode(response)

		if data["status"] == "close" then
			game:Shutdown()
		end

		for _, v in pairs(data["evicted"]) do
			for _, player in pairs(game:GetService("Players"):GetPlayers()) do
				if player.userId == v then
					player:Kick()
				end
			end
		end
	end)
end

local function find(t, pred)
    for pos, value in ipairs(t) do
        if pred == value then
            return pos
        end
    end
    return nil
end

local filtered = false

if workspace.FilteringEnabled == true then
	filtered = true

	workspace.FilteringEnabled = false
end

local whitelistedEvents = {"OnServerEvent",
"PromptProductPurchaseFinished", "PromptPurchaseFinished",
"PromptPurchaseRequested", "ClientPurchaseSuccess", "ServerPurchaseVerification",
"Activated", "Deactivated", "SimulationRadiusChanged", "LuaDialogCallbackSignal", "ServerAdVerification",
"ClientAdVerificationResults", "Player", "InsertService"}

ns.ChildAdded:connect(function(replicator) -- mostly from polygon tbh with some added changes
	local accepted = false

		replicator:SetBasicFilteringEnabled(true)

		if filtered == true then
			replicator:PreventTerrainChanges()
		end

		replicator.NewFilter = function(item)
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				--print(player.Name .. " created a new item: " .. item.ClassName .. " " .. item.Name)

				logEvent(player, item, player.Name .. " created a new item: " .. item.ClassName .. " " .. item.Name)
			end

			if accepted == true and filtered == false then
				return Enum.FilterResult.Accepted
			end

			if item and item:IsA("StringValue") then return Enum.FilterResult.Accepted end -- ticket

			if item and item:IsA("Animation") then return Enum.FilterResult.Accepted end

			if item and item:IsA("AnimationTrack") then return Enum.FilterResult.Accepted end

			if item and item:IsA("StarterPack") then return Enum.FilterResult.Accepted end

			if item and item:IsA("StarterGear") then return Enum.FilterResult.Accepted end

			if item and item:IsA("Player") then return Enum.FilterResult.Accepted end

			if item and item:IsA("Weld") then
				if(replicator:GetPlayer()) then
					local player = replicator:GetPlayer()

					if player.Character ~= nil then
						if item:IsDescendantOf(player.Character) then
							return Enum.FilterResult.Accepted
						end
					end
				end
			end
			
			return Enum.FilterResult.Rejected
		end		
		
		replicator.DeleteFilter = function(item)
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				--print(player.Name .. " deleted an item: " .. item.ClassName)

				logEvent(player, item, player.Name .. " deleted an item: " .. item.ClassName)
			end

			if accepted == true and filtered == false then
				return Enum.FilterResult.Accepted
			end

			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				if item:IsDescendantOf(player) then
					return Enum.FilterResult.Accepted
				end
				
				if player.Character ~= nil then
					if item:IsDescendantOf(player.Character) then
						return Enum.FilterResult.Accepted
					end
				end
			end

			return Enum.FilterResult.Rejected
		end
	
		replicator.PropertyFilter = function(item, member, value)
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				--print(player.Name .. " changed a property: " .. item.ClassName .. "." .. member)

				logEvent(player, item, player.Name .. " changed a property: " .. item.ClassName .. "." .. member)
			end

			if accepted == true and filtered == false then
				return Enum.FilterResult.Accepted
			end

			if item and item:IsA("Tool") then	
				return Enum.FilterResult.Accepted
			end 

			if item and item:IsA("Humanoid") and member == "TargetPoint" then return Enum.FilterResult.Accepted end 
	
			if item and item:IsA("StringValue") then return Enum.FilterResult.Accepted end -- ticket

			if item and item:IsA("Animation") then return Enum.FilterResult.Accepted end

			if item and item:IsA("AnimationTrack") then return Enum.FilterResult.Accepted end

			if item and item:IsA("StarterPack") then return Enum.FilterResult.Accepted end

			if item and item:IsA("StarterGear") then return Enum.FilterResult.Accepted end

			return Enum.FilterResult.Rejected
		end		
		
		replicator.EventFilter = function(item)	
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				--print(player.Name .. " fired an event: " .. item.ClassName)

				logEvent(player, item, player.Name .. " fired an event: " .. item.ClassName)
			end

			if accepted == true and filtered == false then
				return Enum.FilterResult.Accepted
			end


			if item and item:IsA("Tool") then return Enum.FilterResult.Accepted end

			if item and item:IsA("Animation") then return Enum.FilterResult.Accepted end

			if item and item:IsA("AnimationTrack") then return Enum.FilterResult.Accepted end

			if item and item:IsA("StarterPack") then return Enum.FilterResult.Accepted end

			if item and item:IsA("StarterGear") then return Enum.FilterResult.Accepted end

			if item and find(whitelistedEvents, item.ClassName) then
				return Enum.FilterResult.Accepted
			end

			return Enum.FilterResult.Rejected
		end

	while not replicator:GetPlayer() do
		wait()
	end

	if(replicator:GetPlayer()) then

    local ok, err = ypcall(function()

		local player = replicator:GetPlayer()

		replicator:DisableProcessPackets()

        if player.CharacterAppearance ~= url .. "/Asset/CharacterFetch.ashx?userId=" ..player.userId .. "&jobId=" .. JobId .. "&placeId=" .. placeId then
            replicator:CloseConnection()
            print("[paclib] kicked " .. player.Name .. " because player does not have correct character appearance for this server")
            print("[paclib] correct character appearance url: " .. url .. "/Asset/CharacterFetch.ashx?userId=" .. player.userId .. "&jobId=" .. JobId .. "&placeId=" .. placeId)
            print("[paclib] appearance that the server received: " .. player.CharacterAppearance)
            return
        end

        if maxPlayers ~= nil and #game:GetService("Players"):GetPlayers() > maxPlayers then
            replicator:CloseConnection()
            print("[paclib] kicked incoming connection because max players reached")
            return
        end



        if player:FindFirstChild("HexagonTicket") == nil or (player:FindFirstChild("HexagonTicket") ~= nil and not player.HexagonTicket:IsA("StringValue")) then
            replicator:CloseConnection()
            print("[paclib] kicked " .. player.Name .. " because player does not have an authentication ticket")
            return
        end

		local HexagonTicket = player.HexagonTicket.Value

		player.HexagonTicket:Remove()


        local response = game:HttpGet(url .. "/verify-player?Username=" .. player.Name .. "&UserID=" .. player.userId .. "&Ticket=" .. urlencode(HexagonTicket) .. "&JobID=" .. JobId .. "&PlaceID=" .. placeId .. "&MembershipType=" .. player.MembershipType.Name .. "&CharacterAppearance=".. player.CharacterAppearance .. "&" .. access, true)
        if response ~= "True" then
            replicator:CloseConnection()
            print("[paclib] kicked " .. player.Name .. " because could not validate player")
            print("[paclib] validation handler returned: " .. response)
            return
        end

		replicator:EnableProcessPackets()

		accepted = true

		replicator:SetBasicFilteringEnabled(false)
        

		--print("[paclib] " .. player.Name .. " has been authenticated")

		if url and access and placeId and player and player.userId then
			game:HttpGet(url .. "/game/ClientPresence.ashx?action=connect&" .. access .. "&PlaceID=" .. placeId .. "&JobID=" .. JobId .. "&UserID=" .. player.userId)
			game:HttpPost(url .. "/game/PlaceVisit.ashx?UserID=" .. player.userId .. "&AssociatedPlaceID=" .. placeId .. "&" .. access, "")
		end
    end)

    if not ok then
        print(tostring(err))
        replicator:CloseConnection()

        print("[paclib] kicked because could not validate player")
        return
    end


	
	while wait(0.5) do
		local player = replicator:GetPlayer()

		if player == nil then
			game:HttpPost(url .. "/game/NewPresence.ashx?action=disconnect&" .. access .. "&PlaceID=" .. placeId .. "&JobID=" .. JobId .. "&UserID=" .. player.userId, "")
		end
	end
else

	replicator:DisableProcessPackets()

end

	

    
end)

-- Now start the connection
local success, message = pcall(function() ns:Start(port) end)
local HttpService = game:GetService("HttpService")
local arguments = {
	["jobid"] = JobId
}

if not success then
	-- failed job close it
	game:HttpPostAsync(url .. "/updatejob/closejob?"..access,HttpService:JSONEncode(arguments),"application/json")
else
	game:HttpPostAsync(url .. "/updatejob/gameloaded?"..access,HttpService:JSONEncode(arguments),"application/json")
end

if timeout then
	scriptContext:SetTimeout(timeout)
end
scriptContext.ScriptsDisabled = false

--[[ analytics...
delay(1, function()
	loadfile(url .. "/analytics/GamePerfMonitor.ashx")(JobId, placeId)
end)
]]

if access then
  game.Close:connect(function()
    sendLogs(true)
  end)

  delay(25, function()
	spawn(function()
    	while true do
			presenceCheck(false)
			sendLogs(false)

			wait(10)
		end
	end)
 end)
end

------------------------------END START GAME SHARED SCRIPT--------------------------

-- START CHAT LOGS --
--[[
CHAT LOG 4 HEXAGON BY BRANDAN
]]--

game:GetService("Players").PlayerAdded:connect(function(player)
	player.Chatted:connect(function(message)
		logChatEvent(player, message)
	end)
end)

-- END CHAT LOGS --
--START EC--
--[[
EC V2, test sounds for now (dec 5 2024)

by brandan for hexagon
]]--

local sound_t = {
	"rbxassetid://6668", -- micro (meow)
	"rbxassetid://6669", -- micro (bark)
	"rbxassetid://9587", -- nsml
	"rbxassetid://9589", -- all around me are familiar faces
}

local ec_trigs = {
	";ec",
	";energycell",
	";finobe",
	";suicide",
	";raymonf",
	";minecraft",
	";sex",
	";cut"
}

local function containsKillPhrase(message)
    for _, phrase in ipairs(ec_trigs) do
        if string.find(string.lower(message), string.lower(phrase)) then
            return true
        end
    end
    return false
end

local players = game:GetService("Players")
players.PlayerAdded:connect(function(player)
	player.Chatted:connect(function(message)
		if containsKillPhrase(message) then
			local c_success, c_result = pcall(function()
				local new_sound = Instance.new("Sound", player["Character"]["Head"])
				new_sound.SoundId = sound_t[math.random(1, #sound_t)]
				
				new_sound.Volume = 0.25
				new_sound:Play();player["Character"]:BreakJoints()
			end)

			if c_success then
				print(string.format("[ec] Triggered on %s", player.Name))
			elseif not c_success and c_result then
				print(string.format("[ec] Failed to trigger on %s", player.Name))
			end
		end
	end)
end)
--END EC--


-- StartGame --

game:GetService("RunService"):Run()

end)

if not ok then
	print(tostring(err))
	Instance.new("Message", workspace).Text = tostring(err)
	game:SetMessage(tostring(err))
	end

--settings().Network.PrintProperties = true
--settings().Network.PrintInstances = true
--settings().Network.PrintEvents = true