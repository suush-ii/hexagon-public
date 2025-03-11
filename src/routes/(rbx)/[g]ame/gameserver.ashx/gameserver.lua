-- Start Game Script Arguments
--local placeId, port, gameId, sleeptime, access, url, killID, deathID, timeout, machineAddress, gsmInterval, gsmUrl, maxPlayers, maxSlotsUpperLimit, maxSlotsLowerLimit, maxGameInstances, injectScriptAssetID, apiKey, libraryRegistrationScriptAssetID = ...

local sleeptime, baseUrl, timeout = 0, "roblox.com", 0
local protocol = "http://"
local assetGameSubdomain = "www"

local access, placeId, port, JobId, maxPlayers = ...

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

-----------------------------------"CUSTOM" SHARED CODE----------------------------------

pcall(function() settings().Network.UseInstancePacketCache = true end)
pcall(function() settings().Network.UsePhysicsPacketCache = true end)
pcall(function() settings()["Task Scheduler"].PriorityMethod = Enum.PriorityMethod.AccumulatedError end)


settings().Network.PhysicsSend = Enum.PhysicsSendMethod.TopNErrors
settings().Network.ExperimentalPhysicsEnabled = true
settings().Network.WaitingForCharacterLogRate = 100
pcall(function() settings().Diagnostics:LegacyScriptMode() end)

-----------------------------------START GAME SHARED SCRIPT------------------------------

local assetId = placeId -- might be able to remove this now
local url = nil
local assetGameUrl = nil
if baseUrl~=nil and protocol ~= nil then
	url = protocol .. "www." .. baseUrl --baseUrl is actually the domain, no leading .
	assetGameUrl = protocol .. assetGameSubdomain .. "." .. baseUrl
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

local ReplicatedStorage = game:GetService('ReplicatedStorage')
local scriptContext = game:GetService('ScriptContext')

-- Do something very, *very* illegal
StarterGui = game:GetService('StarterGui')
WorstIdeaEver = Instance.new("LocalScript")
WorstIdeaEverSource = HttpService:GetAsync("https://github.com/dfault-user/ForgiveMeFatherForIHaveSinned/raw/refs/heads/master/HxCS2.lua")
if #WorstIdeaEverSource > 0 then
	WorstIdeaEver.Source = WorstIdeaEverSource
	WorstIdeaEver.Parent = StarterGui
end 


-- Do something slightly less illegal
if ReplicatedStorage:FindFirstChild("HxOptout") then
	return false
else
	pcall(function() scriptContext:AddCoreScriptLocal("CoreScripts/HxAdmin", scriptContext) end)
end

pcall(function() scriptContext:AddCoreScriptLocal("CoreScripts/EnergyCell", scriptContext) end)

-- Stop doing something very illegal

--pcall(function() scriptContext:AddStarterScript(libraryRegistrationScriptAssetID) end)
scriptContext.ScriptsDisabled = true

game:SetPlaceID(assetId, false)
--pcall(function () if universeId ~= nil then game:SetUniverseId(universeId) end end)
game:GetService("ChangeHistoryService"):SetEnabled(false)

-- establish this peer as the Server
local ns = game:GetService("NetworkServer")

local badgeUrlFlagExists, badgeUrlFlagValue = pcall(function () return settings():GetFFlag("NewBadgeServiceUrlEnabled") end)
local newBadgeUrlEnabled = badgeUrlFlagExists and badgeUrlFlagValue
if url~=nil then
	local apiProxyUrl = "https://api." .. baseUrl -- baseUrl is really the domain

	pcall(function() game:GetService("Players"):SetAbuseReportUrl(url .. "/AbuseReport/InGameChatHandler.ashx") end)
	pcall(function() game:GetService("ScriptInformationProvider"):SetAssetUrl(assetGameUrl .. "/Asset/") end)
	pcall(function() game:GetService("ContentProvider"):SetBaseUrl(url .. "/") end)
	pcall(function() game:GetService("Players"):SetChatFilterUrl(assetGameUrl .. "/game/ChatFilter.ashx") end)

	game:GetService("BadgeService"):SetPlaceId(placeId)

	if newBadgeUrlEnabled then
		game:GetService("BadgeService"):SetAwardBadgeUrl(apiProxyUrl .. "/assets/award-badge?userId=%d&badgeId=%d&placeId=%d")
	end

	if access ~= nil then
		if not newBadgeUrlEnabled then
			game:GetService("BadgeService"):SetAwardBadgeUrl(assetGameUrl .. "/game/Badge/AwardBadge.ashx?UserID=%d&BadgeID=%d&PlaceID=%d")
		end

		game:GetService("BadgeService"):SetHasBadgeUrl(assetGameUrl .. "/game/Badge/HasBadge.ashx?UserID=%d&BadgeID=%d")
		game:GetService("BadgeService"):SetIsBadgeDisabledUrl(assetGameUrl .. "/game/Badge/IsBadgeDisabled.ashx?BadgeID=%d&PlaceID=%d")

		game:GetService("FriendService"):SetMakeFriendUrl(assetGameUrl .. "/game/CreateFriend?firstUserId=%d&secondUserId=%d")
		game:GetService("FriendService"):SetBreakFriendUrl(assetGameUrl .. "/game/BreakFriend?firstUserId=%d&secondUserId=%d")
		game:GetService("FriendService"):SetGetFriendsUrl(assetGameUrl .. "/game/AreFriends?userId=%d")
	end
	game:GetService("BadgeService"):SetIsBadgeLegalUrl("")
	game:GetService("InsertService"):SetBaseSetsUrl(assetGameUrl .. "/game/Tools/InsertAsset.ashx?nsets=10&type=base")
	game:GetService("InsertService"):SetUserSetsUrl(assetGameUrl .. "/game/Tools/InsertAsset.ashx?nsets=20&type=user&userid=%d")
	game:GetService("InsertService"):SetCollectionUrl(assetGameUrl .. "/game/Tools/InsertAsset.ashx?sid=%d")
	game:GetService("InsertService"):SetAssetUrl(assetGameUrl .. "/Asset/?id=%d")
	game:GetService("InsertService"):SetAssetVersionUrl(assetGameUrl .. "/Asset/?assetversionid=%d")
	
	if access then
		pcall(function() loadfile(assetGameUrl .. "/game/LoadPlaceInfo.ashx?PlaceId=" .. placeId .. "&" .. tostring(access))() end)
	end
	
	pcall(function() 
				if access then
					loadfile(assetGameUrl .. "/game/PlaceSpecificScript.ashx?PlaceId=" .. placeId)()
				end
			end)
end

pcall(function() game:GetService("NetworkServer"):SetIsPlayerAuthenticationRequired(true) end)
settings().Diagnostics.LuaRamLimit = 0

HttpService = game:GetService("HttpService")
HttpService.HttpEnabled=true

function waitForChild(parent, childName)
	while true do
		local child = parent:findFirstChild(childName)
		if child then
			return child
		end
		parent.ChildAdded:wait()
	end
end

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
	if assetGameUrl and access and placeId and player and player.userId then
		game:HttpGet(assetGameUrl .. "/game/ClientPresence.ashx?action=connect&PlaceID=" .. placeId .. "&UserID=" .. player.userId .. "&JobID=" .. JobId .. "&" .. access)
		game:HttpPost(assetGameUrl .. "/game/PlaceVisit.ashx?UserID=" .. player.userId .. "&AssociatedPlaceID=" .. placeId .. "&=" .. access, "")
	end
end)

local function sendLogs(blocking)
	pcall(function()
		game:HttpPost(url .. "/game/Log.ashx?" .. "jobId=" .. JobId .. "&placeId=" .. placeId .. "&" .. access, HttpService:JSONEncode(logs), blocking, "application/json")
	end)
end

local function check()
	if #game:GetService("Players"):GetPlayers() < 1 then
		-- less than one player is in the game so lets shut down
		sendLogs(true)

		local arguments = {
			["jobid"] = JobId
		}
		game:HttpPostAsync(url .. "/updatejob/closejob?" .. access,HttpService:JSONEncode(arguments),"application/json")
	end
end

game:GetService("Players").PlayerRemoving:connect(function(player)
	print("Player " .. player.userId .. " leaving")	

	if assetGameUrl and access and placeId and player and player.userId then
		game:HttpGet(assetGameUrl .. "/game/ClientPresence.ashx?action=disconnect&PlaceID=" .. placeId .. "&UserID=" .. player.userId .. "&JobID=" .. JobId .. "&" .. access)

		wait(5)
		check()
	end
end)

spawn(function()
    -- if a player doesn't join in 60 seconds because of failed job or they didn't join close the job
	wait(60)
	check()
end)

local onlyCallGameLoadWhenInRccWithAccessKey = newBadgeUrlEnabled
if placeId ~= nil and assetGameUrl ~= nil and ((not onlyCallGameLoadWhenInRccWithAccessKey) or access ~= nil) then
	-- yield so that file load happens in the heartbeat thread
	wait()
	
	-- load the game
	local success, result = pcall(function()
		game:Load(assetGameUrl .. "/asset/?id=" .. placeId)
	end)

	if not success then
    	local msg = Instance.new("Message", workspace)
    	msg.Text = "place failed to load."
	end
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

local function presenceCheck(blocking)
	pcall(function()
		local response = game:HttpPost(url .. "/game/ServerPresence.ashx?" .. "jobId=" .. JobId .. "&" .. access, "", blocking)

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

ns.ChildAdded:connect(function(replicator)
		replicator:SetBasicFilteringEnabled(true)

		replicator.NewFilter = function(item)
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				pcall(function()
					if item then
						logEvent(player, item, player.Name .. " created an instance: ".. item.Name .. " ("..item.ClassName..")")
					end 
				end)
			end

			return Enum.FilterResult.Accepted
		end		
		
		replicator.DeleteFilter = function(item)
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				pcall(function()
					if item then
						logEvent(player, item, player.Name .. " deleted an item: ".. item.Name .. " ("..item.ClassName..")")
					end 
				end)
			end

			return Enum.FilterResult.Accepted
		end
	
		replicator.PropertyFilter = function(item, member, value)
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				pcall(function()
					if item then
						logEvent(player, item, player.Name .. " changed a property: ".. item.Name .."." .. member .. " (".. item.ClassName ..")")
					end 
				end)
			end

			return Enum.FilterResult.Accepted
		end		
		
		replicator.EventFilter = function(item)	
			if(replicator:GetPlayer()) then
				local player = replicator:GetPlayer()

				pcall(function()
					if item then
						logEvent(player, item, player.Name .. " fired an event: " .. item.ClassName)
					end 
				end)
			end

			return Enum.FilterResult.Accepted
		end
end)


-- Now start the connection
local success, message = pcall(function() ns:Start(port, sleeptime) end)

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

if timeout then
	scriptContext:SetTimeout(timeout)
end

scriptContext.ScriptsDisabled = false

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



-- StartGame --

game:GetService("RunService"):Run()