/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Empty response, will be in WebAPI base soon */
export type RobloxApiAvatarControllersV1AvatarControllerEmptyResponse = object

/** A model that contains a list of asset ids */
export interface RobloxApiAvatarModelsAssetIdListModel {
	/** The asset ids */
	assetIds?: number[]
}

/** Exhaustive model denoting all possible metadata fields of an asset */
export interface RobloxApiAvatarModelsAssetMetaModelV1 {
	/**
	 * Layered-clothing order
	 * @format int32
	 */
	order?: number
	/**
	 * Layered-clothing puffiness
	 * @format float
	 */
	puffiness?: number
	position?: RobloxAvatarcoreSharedV3Beta1AssetPosition
	rotation?: RobloxAvatarcoreSharedV3Beta1AssetRotation
	scale?: RobloxAvatarcoreSharedV3Beta1AssetScale
	/**
	 * Client-authoritative meta model format version
	 * - default is always 1
	 * @format int32
	 */
	version?: number
}

/**
 * A model containing details about an asset
 * - V2: adds CurrentVersionId, AssetMetaModel
 */
export interface RobloxApiAvatarModelsAssetModelV2 {
	/**
	 * The id
	 * @format int64
	 */
	id?: number
	/** The name */
	name?: string
	/** A model containing details about an asset type */
	assetType?: RobloxApiAvatarModelsAssetTypeModel
	/**
	 * Id of the current version of asset
	 * @format int64
	 */
	currentVersionId?: number
	/** Exhaustive model denoting all possible metadata fields of an asset */
	meta?: RobloxApiAvatarModelsAssetMetaModelV1
}

/** A model containing details about an asset type */
export interface RobloxApiAvatarModelsAssetTypeModel {
	/**
	 * The id
	 * @format int64
	 */
	id?: number
	/** The name */
	name?: string
}

/** A model containing details about an asset type and its business rules */
export interface RobloxApiAvatarModelsAssetTypeRulesModel {
	/**
	 * The max number of this asset type that can be worn
	 * @format int32
	 */
	maxNumber?: number
	/**
	 * The id
	 * @format int64
	 */
	id?: number
	/** The name */
	name?: string
}

/** Success response class */
export interface RobloxApiAvatarModelsAvatarApiSuccessResponse {
	/** Gets or sets a value indicating whether the request was a success. */
	success?: boolean
}

/** A model containing website metadata for avatars */
export interface RobloxApiAvatarModelsAvatarMetadataModel {
	/** Whether or not to show the Default Clothing message */
	enableDefaultClothingMessage?: boolean
	/** Whether or not the Scales is embedded in the tab */
	isAvatarScaleEmbeddedInTab?: boolean
	/** Whether or not the Boby Type scale is embedded in the tab */
	isBodyTypeScaleOutOfTab?: boolean
	/**
	 * How much the height scaler should increment by
	 * @format double
	 */
	scaleHeightIncrement?: number
	/**
	 * How much the width scaler should increment by
	 * @format double
	 */
	scaleWidthIncrement?: number
	/**
	 * How much the head scaler should increment by
	 * @format double
	 */
	scaleHeadIncrement?: number
	/**
	 * How much the proportion scaler should increment by
	 * @format double
	 */
	scaleProportionIncrement?: number
	/**
	 * How much the body type scaler should increment by
	 * @format double
	 */
	scaleBodyTypeIncrement?: number
	/** Whether or not to support proportion and body type */
	supportProportionAndBodyType?: boolean
	/** Whether or not to show the default clothing message when the page loads */
	showDefaultClothingMessageOnPageLoad?: boolean
	/** Whether or not 3D thumbnails are shown */
	areThreeDeeThumbsEnabled?: boolean
	/** Does the frontend lock avatar editor input until the wearing call returns */
	isAvatarWearingApiCallsLockingOnFrontendEnabled?: boolean
	/** Does the frontend lock avatar editor input until the wearing call returns */
	isOutfitHandlingOnFrontendEnabled?: boolean
	/** Determines whether a bunch of UI improvements are released */
	isJustinUiChangesEnabled?: boolean
	/** Determines whether Category Reorg is released */
	isCategoryReorgEnabled?: boolean
	/** Flag for both web UI and App, name is fixed due to sharing, do not change */
	LCEnabledInEditorAndCatalog?: boolean
	/**
	 * Useful for the time between enabling Jackets for most users and
	 * all LC types for everyone, meanwhile Soothsayers need all types
	 * at all times
	 */
	isLCCompletelyEnabled?: boolean
}

/** A model containing details about an avatar */
export interface RobloxApiAvatarModelsAvatarModelV2 {
	scales?: RobloxWebResponsesAvatarScaleModel
	/**
	 * The avatar type ['R6' = 1, 'R15' = 3]
	 * @format int32
	 */
	playerAvatarType?: 1 | 3
	/** A model container BrickColor ids for each body part. */
	bodyColors?: RobloxApiAvatarModelsBodyColorsModel
	/** The assets worn on the character */
	assets?: RobloxApiAvatarModelsAssetModelV2[]
	/** Whether default clothing has been applied to this avatar. */
	defaultShirtApplied?: boolean
	/** Whether default clothing has been applied to this avatar. */
	defaultPantsApplied?: boolean
	/** The emotes on the character */
	emotes?: RobloxApiAvatarModelsEmoteResponseModel[]
}

/** A model containing details about avatar-related business rules */
export interface RobloxApiAvatarModelsAvatarRulesModel {
	/** The avatar type */
	playerAvatarTypes?: (1 | 3)[]
	/** The scales */
	scales?: Record<string, RobloxApiAvatarModelsScaleRulesModel>
	/** The assets worn on the character */
	wearableAssetTypes?: RobloxApiAvatarModelsAssetTypeRulesModel[]
	/**
	 * The list of asset types for Accessory Refinement.
	 * @uniqueItems true
	 */
	accessoryRefinementTypes?: (
		| 1
		| 2
		| 3
		| 4
		| 5
		| 6
		| 7
		| 8
		| 9
		| 10
		| 11
		| 12
		| 13
		| 16
		| 17
		| 18
		| 19
		| 21
		| 22
		| 24
		| 25
		| 26
		| 27
		| 28
		| 29
		| 30
		| 31
		| 32
		| 33
		| 34
		| 35
		| 37
		| 38
		| 39
		| 40
		| 41
		| 42
		| 43
		| 44
		| 45
		| 46
		| 47
		| 48
		| 49
		| 50
		| 51
		| 52
		| 53
		| 54
		| 55
		| 56
		| 59
		| 60
		| 61
		| 62
		| 63
		| 64
		| 65
		| 66
		| 67
		| 68
		| 69
		| 70
		| 71
		| 72
		| 73
		| 74
		| 75
		| 76
		| 77
		| 78
		| 79
		| 80
		| 81
		| 82
	)[]
	/** The lower bounds for accessory refinement settings. */
	accessoryRefinementLowerBounds?: {
		Image?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		TShirt?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Audio?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Mesh?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Lua?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		HTML?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Text?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Hat?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Place?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Model?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Shirt?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Pants?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Decal?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Avatar?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Head?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Face?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Gear?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Badge?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		GroupEmblem?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Animation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Arms?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Legs?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Torso?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RightArm?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LeftArm?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LeftLeg?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RightLeg?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Package?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		YouTubeVideo?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		GamePass?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		App?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Code?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Plugin?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		SolidModel?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		MeshPart?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		HairAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FaceAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		NeckAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ShoulderAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FrontAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		BackAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		WaistAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ClimbAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		DeathAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FallAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		IdleAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		JumpAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RunAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		SwimAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		WalkAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		PoseAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LocalizationTableManifest?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LocalizationTableTranslation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		EmoteAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Video?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		TexturePack?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		TShirtAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ShirtAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		PantsAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		JacketAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		SweaterAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ShortsAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LeftShoeAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RightShoeAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		DressSkirtAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FontFamily?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FontFace?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		MeshHiddenSurfaceRemoval?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		EyebrowAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		EyelashAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		MoodAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		DynamicHead?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		CodeSnippet?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		AdsVideo?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		OtaUpdate?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
	}
	/** The lower bounds for accessory refinement settings. */
	accessoryRefinementUpperBounds?: {
		Image?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		TShirt?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Audio?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Mesh?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Lua?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		HTML?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Text?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Hat?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Place?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Model?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Shirt?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Pants?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Decal?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Avatar?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Head?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Face?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Gear?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Badge?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		GroupEmblem?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Animation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Arms?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Legs?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Torso?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RightArm?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LeftArm?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LeftLeg?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RightLeg?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Package?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		YouTubeVideo?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		GamePass?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		App?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Code?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Plugin?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		SolidModel?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		MeshPart?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		HairAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FaceAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		NeckAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ShoulderAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FrontAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		BackAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		WaistAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ClimbAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		DeathAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FallAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		IdleAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		JumpAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RunAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		SwimAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		WalkAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		PoseAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LocalizationTableManifest?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LocalizationTableTranslation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		EmoteAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		Video?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		TexturePack?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		TShirtAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ShirtAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		PantsAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		JacketAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		SweaterAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		ShortsAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		LeftShoeAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		RightShoeAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		DressSkirtAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FontFamily?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		FontFace?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		MeshHiddenSurfaceRemoval?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		EyebrowAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		EyelashAccessory?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		MoodAnimation?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		DynamicHead?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		CodeSnippet?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		AdsVideo?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
		OtaUpdate?: RobloxAvatarcoreCommonModelsAccessoryRefinementModel
	}
	/** The full set of usable body colors */
	bodyColorsPalette?: RobloxApiAvatarModelsBodyColorModel[]
	/** The basic set of body colors */
	basicBodyColorsPalette?: RobloxApiAvatarModelsBodyColorModel[]
	/**
	 * The minimum Delta-E difference in body colors
	 * for default clothing not to be applied
	 * @format double
	 */
	minimumDeltaEBodyColorDifference?: number
	/** Whether proportion and bodyType scales are allowed to be set by the authenticated user */
	proportionsAndBodyTypeEnabledForUser?: boolean
	/** A model containing details about avatar-related business rules */
	defaultClothingAssetLists?: RobloxApiAvatarModelsDefaultClothingAssets
	/** Whether or not bundles are enabled for the specific user */
	bundlesEnabledForUser?: boolean
	/** Whether or not emotes are enabled */
	emotesEnabledForUser?: boolean
}

/** A model container BrickColor ids for each body part. */
export interface RobloxApiAvatarModelsBodyColorModel {
	/**
	 * The BrickColor id
	 * @format int32
	 */
	brickColorId?: number
	/** The hex color, e.g. #FFFFFF */
	hexColor?: string
	/** The name of the BrickColor */
	name?: string
}

/** A model container BrickColor ids for each body part. */
export interface RobloxApiAvatarModelsBodyColorsModel {
	/**
	 * The BrickColor id for head color
	 * @format int32
	 */
	headColorId?: number
	/**
	 * The BrickColor id for torso color
	 * @format int32
	 */
	torsoColorId?: number
	/**
	 * The BrickColor id for right arm color
	 * @format int32
	 */
	rightArmColorId?: number
	/**
	 * The BrickColor id for left arm color
	 * @format int32
	 */
	leftArmColorId?: number
	/**
	 * The BrickColor id for right leg color
	 * @format int32
	 */
	rightLegColorId?: number
	/**
	 * The BrickColor id for left leg color
	 * @format int32
	 */
	leftLegColorId?: number
}

/** A model containing details about avatar-related business rules */
export interface RobloxApiAvatarModelsDefaultClothingAssets {
	/** List of asset Ids used to equip shirts for default clothing when the avatar appears nude. */
	defaultShirtAssetIds?: number[]
	/** List of asset Ids used to equip pants for default clothing when the avatar appears nude. */
	defaultPantAssetIds?: number[]
}

/** Response object representing a user's emote */
export interface RobloxApiAvatarModelsEmoteResponseModel {
	/**
	 * The asset id of the emote
	 * @format int64
	 */
	assetId?: number
	/** The name of the emote */
	assetName?: string
	/**
	 * The position the emote is equipped to
	 * @format int32
	 */
	position?: number
}

/** The game start info */
export interface RobloxApiAvatarModelsGameStartInfoResponse {
	/** Avatar Type */
	gameAvatarType?: string
	/** Custom animation enabled */
	allowCustomAnimations?: string
	/** collision type for the univers */
	universeAvatarCollisionType?: string
	/** Body type for the univers */
	universeAvatarBodyType?: string
	/** Joing positioning type */
	jointPositioningType?: string
	/** Mesasge */
	message?: string
	universeAvatarMinScales?: RobloxWebResponsesAvatarScaleModel
	universeAvatarMaxScales?: RobloxWebResponsesAvatarScaleModel
	/** asset overrides for the univers */
	universeAvatarAssetOverrides?: RobloxApiAvatarModelsUniverseAvatarAssetOverrideResponseModel[]
	/** Moderation status */
	moderationStatus?: string
}

/** A model containing details about a user outfit */
export interface RobloxApiAvatarModelsOutfitDetailsModel {
	/**
	 * The id
	 * @format int64
	 */
	id?: number
	/**
	 * The universe id of the outfit, null when outfit is not created in-experience
	 * @format int64
	 */
	universeId?: number
	/** The name */
	name?: string
	/** A list of assetIds */
	assets?: RobloxApiAvatarModelsAssetModelV2[]
	/** A model container BrickColor ids for each body part. */
	bodyColors?: RobloxApiAvatarModelsBodyColorsModel
	scale?: RobloxWebResponsesAvatarScaleModel
	/** The player avatar type - this can be R6 or R15. */
	playerAvatarType?: string
	/** The outfit type of the outfit */
	outfitType?: string
	/** Whether the outfit can be edited by the user */
	isEditable?: boolean
	/** The moderation status of the outfit, not applicable when outfit is created outside experience */
	moderationStatus?: string
}

/** A slim model for user outfits */
export interface RobloxApiAvatarModelsOutfitModel {
	/**
	 * The id
	 * @format int64
	 */
	id?: number
	/** The name */
	name?: string
	/** Whether the outfit can be modified by the user */
	isEditable?: boolean
}

/** A model containing details needed to update or create an outfit */
export interface RobloxApiAvatarModelsOutfitUpdateModelV1 {
	/** The outfit name */
	name?: string
	/** A model container BrickColor ids for each body part. */
	bodyColors?: RobloxApiAvatarModelsBodyColorsModel
	/** The outfit asset IDs */
	assetIds?: number[]
	scale?: RobloxWebResponsesAvatarScaleModel
	/** The avatar scale */
	playerAvatarType?: string
	/**
	 * The type of outfit ['Invalid' = 0, 'Avatar' = 1, 'DynamicHead' = 2, 'InExperienceBody' = 3]
	 * @format int32
	 */
	outfitType?: 0 | 1 | 2 | 3
}

/** A model that contains a playerAvatarType */
export interface RobloxApiAvatarModelsPlayerAvatarTypeModel {
	/**
	 * The playerAvatarType ['R6' = 1, 'R15' = 3]
	 * @format int32
	 */
	playerAvatarType?: 1 | 3
}

/** A model containing details about a recent item */
export interface RobloxApiAvatarModelsRecentItemModel {
	/**
	 * The id. Check the type to figure out what kind of recent item this is.
	 * @format int64
	 */
	id?: number
	/** The name */
	name?: string
	/**
	 * The recent item's type. Can be Asset or Outfit ['Asset' = 1, 'Outfit' = 2]
	 * @format int32
	 */
	type?: 1 | 2
	/** A model containing details about an asset type */
	assetType?: RobloxApiAvatarModelsAssetTypeModel
	/** The outfit's editability (only included if it is an outfit) */
	isEditable?: boolean
}

/** A model that contains information about the max/mins for each scale */
export interface RobloxApiAvatarModelsScaleRulesModel {
	/**
	 * The min scale
	 * @format double
	 */
	min?: number
	/**
	 * The max scale
	 * @format double
	 */
	max?: number
	/**
	 * The increment of the scale
	 * @format double
	 */
	increment?: number
}

export interface RobloxApiAvatarModelsUniverseAvatarAssetOverrideResponseModel {
	/** @format int64 */
	assetID?: number
	/** @format int32 */
	assetTypeID?: number
	isPlayerChoice?: boolean
}

/** A model for wear outfit responses */
export interface RobloxApiAvatarModelsWearResponseModel {
	/**
	 * The assets that could not be worn
	 * Unlike invalidAssetIds, only contains assets that are wearable types
	 */
	invalidAssets?: RobloxApiAvatarModelsAssetModelV2[]
	/** The asset ids that could not be worn */
	invalidAssetIds?: number[]
	/** Whether or not all the outfit contents were successfully worn */
	success?: boolean
}

export interface RobloxAvatarcoreCommonModelsAccessoryPositionModel {
	/** @format float */
	xPosition?: number
	/** @format float */
	yPosition?: number
	/** @format float */
	zPosition?: number
}

export interface RobloxAvatarcoreCommonModelsAccessoryRefinementModel {
	position?: RobloxAvatarcoreCommonModelsAccessoryPositionModel
	rotation?: RobloxAvatarcoreCommonModelsAccessoryRotationModel
	scale?: RobloxAvatarcoreCommonModelsAccessoryScaleModel
}

export interface RobloxAvatarcoreCommonModelsAccessoryRotationModel {
	/** @format float */
	xRotation?: number
	/** @format float */
	yRotation?: number
	/** @format float */
	zRotation?: number
}

export interface RobloxAvatarcoreCommonModelsAccessoryScaleModel {
	/** @format float */
	xScale?: number
	/** @format float */
	yScale?: number
	/** @format float */
	zScale?: number
}

export interface RobloxAvatarcoreSharedV3Beta1AssetPosition {
	/** @format float */
	X?: number
	/** @format float */
	Y?: number
	/** @format float */
	Z?: number
}

export interface RobloxAvatarcoreSharedV3Beta1AssetRotation {
	/** @format float */
	X?: number
	/** @format float */
	Y?: number
	/** @format float */
	Z?: number
}

export interface RobloxAvatarcoreSharedV3Beta1AssetScale {
	/** @format float */
	Scale?: number
	/** @format float */
	X?: number
	/** @format float */
	Y?: number
	/** @format float */
	Z?: number
}

export interface RobloxWebResponsesAvatarScaleModel {
	/** @format double */
	height?: number
	/** @format double */
	width?: number
	/** @format double */
	head?: number
	/** @format double */
	depth?: number
	/** @format double */
	proportion?: number
	/** @format double */
	bodyType?: number
}

/** Filtered page response */
export interface RobloxApiAvatarModelsAvatarFilteredPageResponseRobloxApiAvatarModelsOutfitModel {
	/**
	 * Number of !:TPagedObject filtered.
	 * @format int32
	 */
	filteredCount?: number
	data?: RobloxApiAvatarModelsOutfitModel[]
	/** @format int64 */
	total?: number
}

export interface RobloxWebWebAPIModelsApiLegacyPageResponseRobloxApiAvatarModelsRecentItemModel {
	data?: RobloxApiAvatarModelsRecentItemModel[]
	/** @format int64 */
	total?: number
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
	/** set parameter to `true` for call `securityWorker` for this request */
	secure?: boolean
	/** request path */
	path: string
	/** content type of request body */
	type?: ContentType
	/** query params */
	query?: QueryParamsType
	/** format of response (i.e. response.json() -> format: "json") */
	format?: ResponseFormat
	/** request body */
	body?: unknown
	/** base url */
	baseUrl?: string
	/** request cancellation token */
	cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
	baseUrl?: string
	baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
	securityWorker?: (
		securityData: SecurityDataType | null
	) => Promise<RequestParams | void> | RequestParams | void
	customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
	data: D
	error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
	Json = 'application/json',
	FormData = 'multipart/form-data',
	UrlEncoded = 'application/x-www-form-urlencoded',
	Text = 'text/plain'
}

export class HttpClient<SecurityDataType = unknown> {
	public baseUrl: string = 'https://avatar.roblox.com'
	private securityData: SecurityDataType | null = null
	private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
	private abortControllers = new Map<CancelToken, AbortController>()
	private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

	private baseApiParams: RequestParams = {
		credentials: 'same-origin',
		headers: {},
		redirect: 'follow',
		referrerPolicy: 'no-referrer'
	}

	constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
		Object.assign(this, apiConfig)
	}

	public setSecurityData = (data: SecurityDataType | null) => {
		this.securityData = data
	}

	protected encodeQueryParam(key: string, value: any) {
		const encodedKey = encodeURIComponent(key)
		return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
	}

	protected addQueryParam(query: QueryParamsType, key: string) {
		return this.encodeQueryParam(key, query[key])
	}

	protected addArrayQueryParam(query: QueryParamsType, key: string) {
		const value = query[key]
		return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
	}

	protected toQueryString(rawQuery?: QueryParamsType): string {
		const query = rawQuery || {}
		const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
		return keys
			.map((key) =>
				Array.isArray(query[key])
					? this.addArrayQueryParam(query, key)
					: this.addQueryParam(query, key)
			)
			.join('&')
	}

	protected addQueryParams(rawQuery?: QueryParamsType): string {
		const queryString = this.toQueryString(rawQuery)
		return queryString ? `?${queryString}` : ''
	}

	private contentFormatters: Record<ContentType, (input: any) => any> = {
		[ContentType.Json]: (input: any) =>
			input !== null && (typeof input === 'object' || typeof input === 'string')
				? JSON.stringify(input)
				: input,
		[ContentType.Text]: (input: any) =>
			input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
		[ContentType.FormData]: (input: FormData) =>
			(Array.from(input.keys()) || []).reduce((formData, key) => {
				const property = input.get(key)
				formData.append(
					key,
					property instanceof Blob
						? property
						: typeof property === 'object' && property !== null
							? JSON.stringify(property)
							: `${property}`
				)
				return formData
			}, new FormData()),
		[ContentType.UrlEncoded]: (input: any) => this.toQueryString(input)
	}

	protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
		return {
			...this.baseApiParams,
			...params1,
			...(params2 || {}),
			headers: {
				...(this.baseApiParams.headers || {}),
				...(params1.headers || {}),
				...((params2 && params2.headers) || {})
			}
		}
	}

	protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
		if (this.abortControllers.has(cancelToken)) {
			const abortController = this.abortControllers.get(cancelToken)
			if (abortController) {
				return abortController.signal
			}
			return void 0
		}

		const abortController = new AbortController()
		this.abortControllers.set(cancelToken, abortController)
		return abortController.signal
	}

	public abortRequest = (cancelToken: CancelToken) => {
		const abortController = this.abortControllers.get(cancelToken)

		if (abortController) {
			abortController.abort()
			this.abortControllers.delete(cancelToken)
		}
	}

	public request = async <T = any, E = any>({
		body,
		secure,
		path,
		type,
		query,
		format,
		baseUrl,
		cancelToken,
		...params
	}: FullRequestParams): Promise<HttpResponse<T, E>> => {
		const secureParams =
			((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
				this.securityWorker &&
				(await this.securityWorker(this.securityData))) ||
			{}
		const requestParams = this.mergeRequestParams(params, secureParams)
		const queryString = query && this.toQueryString(query)
		const payloadFormatter = this.contentFormatters[type || ContentType.Json]
		const responseFormat = format || requestParams.format

		return this.customFetch(
			`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
			{
				...requestParams,
				headers: {
					...(requestParams.headers || {}),
					...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {})
				},
				signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
				body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body)
			}
		).then(async (response) => {
			const r = response.clone() as HttpResponse<T, E>
			r.data = null as unknown as T
			r.error = null as unknown as E

			const data = !responseFormat
				? r
				: await response[responseFormat]()
						.then((data) => {
							if (r.ok) {
								r.data = data
							} else {
								r.error = data
							}
							return r
						})
						.catch((e) => {
							r.error = e
							return r
						})

			if (cancelToken) {
				this.abortControllers.delete(cancelToken)
			}

			if (!response.ok) throw data
			return data
		})
	}
}

/**
 * @title Avatar Api v1
 * @version v1
 * @baseUrl https://avatar.roblox.com
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
	v1 = {
		/**
		 * No description
		 *
		 * @tags Avatar
		 * @name AvatarList
		 * @summary Returns details about the authenticated user's avatar
		 * @request GET:/v1/avatar
		 */
		avatarList: (params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAvatarModelV2, void>({
				path: `/v1/avatar`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * @description BodyColorsPalette is a list of valid brickColors you can choose for your avatar. WearableAssetTypes contains a list of asset types with names, ids, and the maximum number that you can wear at a time. Does not include packages because they cannot be worn on your avatar directly. PlayerAvatarTypes are the types of avatars you can choose between.
		 *
		 * @tags Avatar
		 * @name AvatarRulesList
		 * @summary Returns the business rules related to avatars
		 * @request GET:/v1/avatar-rules
		 */
		avatarRulesList: (params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAvatarRulesModel, any>({
				path: `/v1/avatar-rules`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Avatar
		 * @name AvatarMetadataList
		 * @summary Returns metadata used by the avatar page of the website
		 * @request GET:/v1/avatar/metadata
		 */
		avatarMetadataList: (params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAvatarMetadataModel, any>({
				path: `/v1/avatar/metadata`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
 * No description
 *
 * @tags Avatar
 * @name GameStartInfoList
 * @summary The server will call this on game server start to request general information about the universe
This is version 1.1, which returns an entry from the UniverseAvatarType enum.
During mixed mode this may return unreliable results.
 * @request GET:/v1/game-start-info
 */
		gameStartInfoList: (
			query: {
				/** @format int64 */
				universeId: number
			},
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsGameStartInfoResponse, any>({
				path: `/v1/game-start-info`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Outfits
		 * @name OutfitsDetailsDetail
		 * @request GET:/v1/outfits/{userOutfitId}/details
		 */
		outfitsDetailsDetail: (userOutfitId: number, params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsOutfitDetailsModel, void>({
				path: `/v1/outfits/${userOutfitId}/details`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
 * No description
 *
 * @tags RecentItem
 * @name RecentItemsListDetail
 * @summary Returns a list of recent items
Recent items can be Assets or Outfits
 * @request GET:/v1/recent-items/{recentItemListType}/list
 */
		recentItemsListDetail: (
			recentItemListType: 0 | 1 | 2 | 3 | 4 | 5 | 6,
			params: RequestParams = {}
		) =>
			this.request<
				RobloxWebWebAPIModelsApiLegacyPageResponseRobloxApiAvatarModelsRecentItemModel,
				void
			>({
				path: `/v1/recent-items/${recentItemListType}/list`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * @description Includes assets, bodycolors, and playerAvatarType.
		 *
		 * @tags Avatar
		 * @name UsersAvatarDetail
		 * @summary Returns details about a specified user's avatar
		 * @request GET:/v1/users/{userId}/avatar
		 */
		usersAvatarDetail: (userId: number, params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAvatarModelV2, void>({
				path: `/v1/users/${userId}/avatar`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Avatar
		 * @name UsersCurrentlyWearingDetail
		 * @summary Gets a list of asset ids that the user is currently wearing
		 * @request GET:/v1/users/{userId}/currently-wearing
		 */
		usersCurrentlyWearingDetail: (userId: number, params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAssetIdListModel, void>({
				path: `/v1/users/${userId}/currently-wearing`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
 * No description
 *
 * @tags Avatar
 * @name UsersOutfitsDetail
 * @summary Deprecated, user v2.
Gets a list of outfits for the specified user.
 * @request GET:/v1/users/{userId}/outfits
 */
		usersOutfitsDetail: (
			userId: number,
			query?: {
				/** The outfit type being searched for, null will return all outfitTypes */
				outfitType?: string
				/**
				 * The page number of the current page of requests, default is 1.
				 * @format int32
				 * @default 1
				 */
				page?: number
				/**
				 * The max number of outfits that can be returned.
				 * @format int32
				 * @default 25
				 */
				itemsPerPage?: number
				/** Whether the outfits are editable. A null value will lead to no filtering. */
				isEditable?: boolean
			},
			params: RequestParams = {}
		) =>
			this.request<
				RobloxApiAvatarModelsAvatarFilteredPageResponseRobloxApiAvatarModelsOutfitModel,
				void
			>({
				path: `/v1/users/${userId}/outfits`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Avatar
		 * @name AvatarAssetsRemoveCreate
		 * @summary Removes the asset from the authenticated user's avatar.
		 * @request POST:/v1/avatar/assets/{assetId}/remove
		 */
		avatarAssetsRemoveCreate: (assetId: number, params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/avatar/assets/${assetId}/remove`,
				method: 'POST',
				format: 'json',
				...params
			}),

		/**
 * No description
 *
 * @tags Avatar
 * @name AvatarAssetsWearCreate
 * @summary Puts the asset on the authenticated user's avatar.
- Flagged as obsolete, does not support layered clothing meta params
 * @request POST:/v1/avatar/assets/{assetId}/wear
 */
		avatarAssetsWearCreate: (assetId: number, params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/avatar/assets/${assetId}/wear`,
				method: 'POST',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Avatar
		 * @name AvatarRedrawThumbnailCreate
		 * @summary Requests the authenticated user's thumbnail be redrawn
		 * @request POST:/v1/avatar/redraw-thumbnail
		 */
		avatarRedrawThumbnailCreate: (params: RequestParams = {}) =>
			this.request<RobloxApiAvatarControllersV1AvatarControllerEmptyResponse, void>({
				path: `/v1/avatar/redraw-thumbnail`,
				method: 'POST',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Avatar
		 * @name AvatarSetBodyColorsCreate
		 * @summary Sets the authenticated user's body colors
		 * @request POST:/v1/avatar/set-body-colors
		 */
		avatarSetBodyColorsCreate: (
			bodyColorsModel: RobloxApiAvatarModelsBodyColorsModel,
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/avatar/set-body-colors`,
				method: 'POST',
				body: bodyColorsModel,
				type: ContentType.Json,
				format: 'json',
				...params
			}),

		/**
		 * @description This is the avatar type chosen on the Avatar page. Some games can override this and force your character to be R6 or R15.
		 *
		 * @tags Avatar
		 * @name AvatarSetPlayerAvatarTypeCreate
		 * @summary Sets the authenticated user's player avatar type (e.g. R6 or R15).
		 * @request POST:/v1/avatar/set-player-avatar-type
		 */
		avatarSetPlayerAvatarTypeCreate: (
			playerAvatarTypeModel: RobloxApiAvatarModelsPlayerAvatarTypeModel,
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/avatar/set-player-avatar-type`,
				method: 'POST',
				body: playerAvatarTypeModel,
				type: ContentType.Json,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Avatar
		 * @name AvatarSetScalesCreate
		 * @summary Sets the authenticated user's scales
		 * @request POST:/v1/avatar/set-scales
		 */
		avatarSetScalesCreate: (
			scalesModel: RobloxWebResponsesAvatarScaleModel,
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/avatar/set-scales`,
				method: 'POST',
				body: scalesModel,
				type: ContentType.Json,
				format: 'json',
				...params
			}),

		/**
 * @description Only allows items that you own, are not expired, and are wearable asset types. Any assets being worn before this method is called are automatically removed.
 *
 * @tags Avatar
 * @name AvatarSetWearingAssetsCreate
 * @summary Sets the avatar's current assets to the list
- Flagged as obsolete, does not support layered clothing meta params
 * @request POST:/v1/avatar/set-wearing-assets
 */
		avatarSetWearingAssetsCreate: (
			assetIdsModel: RobloxApiAvatarModelsAssetIdListModel,
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsWearResponseModel, void>({
				path: `/v1/avatar/set-wearing-assets`,
				method: 'POST',
				body: assetIdsModel,
				type: ContentType.Json,
				format: 'json',
				...params
			}),

		/**
		 * @description You are only allowed to delete outfits you created.
		 *
		 * @tags Outfits
		 * @name OutfitsDeleteCreate
		 * @summary Deletes the outfit
		 * @request POST:/v1/outfits/{userOutfitId}/delete
		 */
		outfitsDeleteCreate: (userOutfitId: number, params: RequestParams = {}) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/outfits/${userOutfitId}/delete`,
				method: 'POST',
				format: 'json',
				...params
			}),

		/**
		 * @description Fails if the user does not own any of the assetIds or if they are not wearable asset types.
		 *
		 * @tags Outfits
		 * @name OutfitsUpdateCreate
		 * @summary Updates the contents of the outfit. Deprecated. There are no calls to this API
		 * @request POST:/v1/outfits/{userOutfitId}/update
		 * @deprecated
		 */
		outfitsUpdateCreate: (
			userOutfitId: number,
			outfitUpdateModel: RobloxApiAvatarModelsOutfitUpdateModelV1,
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/outfits/${userOutfitId}/update`,
				method: 'POST',
				body: outfitUpdateModel,
				type: ContentType.Json,
				format: 'json',
				...params
			}),

		/**
		 * @description Fails if any of the assetIds are not owned by the user, or not wearable types. The name property of the request is optional as one will be auto-generated when the request has a null name.
		 *
		 * @tags Outfits
		 * @name OutfitsCreateCreate
		 * @summary Creates a new outfit.
		 * @request POST:/v1/outfits/create
		 */
		outfitsCreateCreate: (
			outfitUpdateModel: RobloxApiAvatarModelsOutfitUpdateModelV1,
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsAvatarApiSuccessResponse, void>({
				path: `/v1/outfits/create`,
				method: 'POST',
				body: outfitUpdateModel,
				type: ContentType.Json,
				format: 'json',
				...params
			}),

		/**
		 * @description Fails if the user does not own any of the assetIds or if they are not wearable asset types. Accepts partial updates.
		 *
		 * @tags Outfits
		 * @name OutfitsPartialUpdate
		 * @summary Updates the contents of an outfit. Deprecated. There are no calls to this API
		 * @request PATCH:/v1/outfits/{userOutfitId}
		 * @deprecated
		 */
		outfitsPartialUpdate: (
			userOutfitId: number,
			outfitUpdateModel: RobloxApiAvatarModelsOutfitUpdateModelV1,
			params: RequestParams = {}
		) =>
			this.request<RobloxApiAvatarModelsOutfitModel, void>({
				path: `/v1/outfits/${userOutfitId}`,
				method: 'PATCH',
				body: outfitUpdateModel,
				type: ContentType.Json,
				format: 'json',
				...params
			})
	}
}
