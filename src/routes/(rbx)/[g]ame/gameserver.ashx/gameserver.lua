-- Start Game Script Arguments
--local placeId, port, gameId, sleeptime, access, url, killID, deathID, timeout, machineAddress, gsmInterval, gsmUrl, maxPlayers, maxSlotsUpperLimit, maxSlotsLowerLimit, maxGameInstances, injectScriptAssetID, apiKey, libraryRegistrationScriptAssetID = ...

local sleeptime, url, timeout = 0, "http://www.roblox.com", 0

local access, placeId, port, JobId, maxPlayers = {1}
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
		game:GetService("BadgeService"):SetAwardBadgeUrl(url .. "/Game/Badge/AwardBadge.ashx?UserID=%d&BadgeID=%d&PlaceID=%d&" .. access)
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
	game:Load(url .. "/asset/?id=" .. placeId .. "&" .. access)

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

ns.ChildAdded:connect(function(replicator) -- mostly from polygon tbh with some added changes
    local ok, err = ypcall(function()

		local player = replicator:GetPlayer()

        i = 0
        if player == nil then
            while wait(0.25) do
                player = replicator:GetPlayer()
                if player ~= nil then break end
                if i == 120 then
                    print("[paclib] kicked incoming connection because could not get player")
                    replicator:CloseConnection()
                    return
                end
                i = i + 1
            end
        end

		replicator:DisableProcessPackets()

        if player.CharacterAppearance ~= url .. "/Asset/CharacterFetch.ashx?userId=" ..player.userId.. "&jobId=" .. JobId .. "&placeId=" .. placeId then
            replicator:CloseConnection()
            print("[paclib] kicked " .. player.Name .. " because player does not have correct character appearance for this server")
            print("[paclib] correct character appearance url: " .. url .. "/Asset/CharacterFetch.ashx?userId=" .. player.userId .. "&jobId=" .. JobId .. "&placeId=" .. placeId)
            print("[paclib] appearance that the server received: " .. player.CharacterAppearance)
            return
        end

        if maxPlayers ~= nil and #game:GetService("Players"):GetPlayers() >= maxPlayers then
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
        

		--print("[paclib] " .. player.Name .. " has been authenticated")

		if url and access and placeId and player and player.userId then
			game:HttpPost(url .. "/game/ClientPresence.ashx?action=connect&" .. access .. "&PlaceID=" .. placeId .. "&JobID=" .. JobId .. "&UserID=" .. player.userId, "")
			game:HttpPost(url .. "/game/PlaceVisit.ashx?UserID=" .. player.userId .. "&AssociatedPlaceID=" .. placeId .. "&" .. access, "")
		end
    end)

    if not ok then
        print(tostring(err))
        replicator:CloseConnection()

        print("[paclib] kicked because could not validate player")
        return
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


if access then
  game.Close:connect(function()
    reportCdn(true)
  end)

  delay(60*5, function()
    while true do
		reportCdn(false)
		wait(60*5)
	end
 end)
end
]]

------------------------------END START GAME SHARED SCRIPT--------------------------


-- StartGame --

if injectScriptAssetID and (injectScriptAssetID < 0) then
	pcall(function() Game:LoadGame(injectScriptAssetID * -1) end)
else
	pcall(function() Game:GetService("ScriptContext"):AddStarterScript(injectScriptAssetID) end)
end

Game:GetService("RunService"):Run()
end)

if not ok then
	print(tostring(err))
	Instance.new("Message", workspace).Text = tostring(err)
	game:SetMessage(tostring(err))
	end