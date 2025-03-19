-- Creates all neccessary scripts for the gui on initial load, everything except build tools
-- Created by Ben T. 10/29/10
-- Please note that these are loaded in a specific order to diminish errors/perceived load time by user
local scriptContext = game:GetService("ScriptContext")
local touchEnabled = false
pcall(function() touchEnabled = game:GetService("UserInputService").TouchEnabled end)

-- library registration
scriptContext:AddCoreScript(60595697, scriptContext,"/Libraries/LibraryRegistration/LibraryRegistration")

local function waitForChild(instance, name)
	while not instance:FindFirstChild(name) do
		instance.ChildAdded:wait()
	end
end
local function waitForProperty(instance, property)
	while not instance[property] do
		instance.Changed:wait()
	end
end

-- Responsible for tracking logging items
local scriptContext = game:GetService("ScriptContext")
scriptContext:AddCoreScript(59002211, scriptContext, "CoreScripts/Sections")

waitForChild(game:GetService("CoreGui"),"RobloxGui")
local screenGui = game:GetService("CoreGui"):FindFirstChild("RobloxGui")

if not touchEnabled then
	-- ToolTipper  (creates tool tips for gui)
	scriptContext:AddCoreScript(36868952,screenGui,"CoreScripts/ToolTip")
	-- SettingsScript 
	scriptContext:AddCoreScript(46295865,screenGui,"CoreScripts/Settings")
end

-- MainBotChatScript
scriptContext:AddCoreScript(39250922,screenGui,"CoreScripts/MainBotChatScript")

-- Popup Script
scriptContext:AddCoreScript(48488453,screenGui,"CoreScripts/PopupScript")
-- Friend Notification Script (probably can use this script to expand out to other notifications)
scriptContext:AddCoreScript(48488400,screenGui,"CoreScripts/NotificationScript")


if not touchEnabled then 
	-- And here I go 
	scriptContext:AddCoreScript(97188758, screenGui, "CoreScripts/ChatScript")
	-- New Player List
	scriptContext:AddCoreScript(48488237,screenGui,"CoreScripts/PlayerListScript")
elseif screenGui.AbsoluteSize.Y > 600 then 
	-- And here I go 
	scriptContext:AddCoreScript(97188758, screenGui, "CoreScripts/ChatScript")
	-- New Player List
	scriptContext:AddCoreScript(48488237,screenGui,"CoreScripts/PlayerListScript")
else 
	delay(5, function()
		if screenGui.AbsoluteSize.Y >= 600 then 
			-- And here I go 
			scriptContext:AddCoreScript(97188758, screenGui, "CoreScripts/ChatScript")
			-- New Player List
			scriptContext:AddCoreScript(48488237,screenGui,"CoreScripts/PlayerListScript")
		end 
	end) 
end 

if game.CoreGui.Version >= 3 then
	-- Backpack Builder, creates most of the backpack gui
	scriptContext:AddCoreScript(53878049,screenGui,"CoreScripts/BackpackScripts/BackpackBuilder")

	waitForChild(screenGui,"CurrentLoadout")
	waitForChild(screenGui,"Backpack")
	local Backpack = screenGui.Backpack
	
	-- Manager handles all big backpack state changes, other scripts subscribe to this and do things accordingly
	if game.CoreGui.Version >= 7 then
		scriptContext:AddCoreScript(89449095,Backpack,"CoreScripts/BackpackScripts/BackpackManager")
	end
	
	-- Backpack Gear (handles all backpack gear tab stuff)
	game:GetService("ScriptContext"):AddCoreScript(89449010,Backpack,"CoreScripts/BackpackScripts/BackpackGear")
	-- Loadout Script, used for gear hotkeys
	scriptContext:AddCoreScript(53878059,screenGui.CurrentLoadout,"CoreScripts/BackpackScripts/LoadoutScript")
	if game.CoreGui.Version >= 8 then
		-- Wardrobe script handles all character dressing operations
		scriptContext:AddCoreScript(-1,Backpack,"CoreScripts/BackpackScripts/BackpackWardrobe")
	end
end

if touchEnabled then -- touch devices don't use same control frame
	waitForChild(screenGui, 'ControlFrame')
	waitForChild(screenGui.ControlFrame, 'BottomLeftControl')
	screenGui.ControlFrame.BottomLeftControl.Visible = false 
end 