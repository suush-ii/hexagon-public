local access = "{}"

game:GetService("Players"):SetSaveDataUrl("http://www.roblox.com/Persistence/SetBlob.ashx?" .. access .. "&placeid=" .. {placeId} .. "&userid=%d")
game:GetService("Players"):SetLoadDataUrl("http://www.roblox.com/Persistence/GetBlobUrl.ashx?" .. access .. "&placeid=" .. {placeId} .. "&userid=%d")
pcall(function() game:GetService("Players"):SetSysStatsUrl("http://www.roblox.com/AbuseReport/Client.ashx?".. access .. "&placeid=" .. {placeId} .. "&jobid=" .. game.JobId) end)

game:GetService("Players").PlayerAdded:connectFirst(function(player)
    player:LoadData()
end)

game:GetService("Players").PlayerRemoving:connectLast(function(player)
    player:SaveData()
end)