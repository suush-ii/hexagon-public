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

/** A model to represent asset favorites. */
export interface RobloxCatalogApiAssetFavoriteModel {
	/**
	 * The Id of the asset being favorited.
	 * @format int64
	 */
	assetId?: number
	/**
	 * The Id of the user favoriting the asset.
	 * @format int64
	 */
	userId?: number
	/**
	 * The time at which the user favorited the asset.
	 * @format date-time
	 */
	created?: string
}

export interface RobloxCatalogApiBundleCreatorModel {
	/** @format int64 */
	id?: number
	name?: string
	type?: string
	hasVerifiedBadge?: boolean
}

export interface RobloxCatalogApiBundleDetailsModel {
	/** @format int64 */
	id?: number
	name?: string
	description?: string
	bundleType?: string
	items?: RobloxCatalogApiBundleItemDetailModel[]
	creator?: RobloxCatalogApiBundleCreatorModel
	product?: RobloxCatalogApiBundleProductModel
	itemRestrictions?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[]
	collectibleItemDetail?: RobloxCatalogApiCollectibleItemDetail
}

/** A model to represent bundle favorites. */
export interface RobloxCatalogApiBundleFavoriteModel {
	/**
	 * The Id of the bundle being favorited.
	 * @format int64
	 */
	bundleId?: number
	/**
	 * The Id of the user favoriting the bundle.
	 * @format int64
	 */
	userId?: number
	/**
	 * The time at which the user favorited the bundle.
	 * @format date-time
	 */
	created?: string
}

export interface RobloxCatalogApiBundleItemDetailModel {
	owned?: boolean
	/** @format int64 */
	id?: number
	name?: string
	type?: string
}

export interface RobloxCatalogApiBundleProductModel {
	/** @format int64 */
	id?: number
	type?: string
	isPublicDomain?: boolean
	isForSale?: boolean
	/** @format int64 */
	priceInRobux?: number
	isFree?: boolean
	noPriceText?: string
	/** Defines the Premium pricing for a catalog item */
	premiumPricing?: RobloxCatalogApiPremiumPricingModel
}

/** The detailed model for catalog items. */
export interface RobloxCatalogApiCatalogSearchDetailedResponseItem {
	/**
	 * The Item Id.
	 * @format int64
	 */
	id?: number
	/**
	 * The Roblox.Catalog.Api.CatalogSearchDetailedResponseItem.ItemType item type. ['Asset' = 1, 'Bundle' = 2]
	 * @format int32
	 */
	itemType?: 1 | 2
	/**
	 * The Roblox.Platform.Assets.AssetType serialized if item is an asset.
	 * @format int32
	 */
	assetType?:
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
	/**
	 * The Roblox.Platform.Bundles.Core.BundleType serialized if item is a bundle.
	 * @format int32
	 */
	bundleType?: 1 | 2 | 3 | 4
	/** The item name. */
	name?: string
	/** The item description. */
	description?: string
	/**
	 * The product id of corresponding item.
	 * @format int64
	 */
	productId?: number
	/** The System.Collections.Generic.IEnumerable`1, serialized if item has genres. */
	genres?: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14)[]
	/** The System.Collections.Generic.IEnumerable`1 contained in the bundle, serialized if item is a bundle. */
	bundledItems?: RobloxCatalogApiBundleItemDetailModel[]
	/** The System.Collections.Generic.IEnumerable`1 if item has Roblox.Catalog.Api.CatalogItemStatus. */
	itemStatus?: (1 | 2 | 7)[]
	/** The System.Collections.Generic.IEnumerable`1 if item has Roblox.Catalog.Api.CatalogItemRestriction. */
	itemRestrictions?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[]
	/** The verified status of a creator */
	creatorHasVerifiedBadge?: boolean
	/**
	 * The Roblox.Catalog.Api.CatalogSearchDetailedResponseItem.CreatorType of the item's creator.
	 * @format int32
	 */
	creatorType?: 1 | 2
	/**
	 * The creator id of the item's creator.
	 * @format int64
	 */
	creatorTargetId?: number
	/** The creator name of the item's creator. */
	creatorName?: string
	/**
	 * The item's price.
	 * @format int64
	 */
	price?: number
	/** Defines the Premium pricing for a catalog item */
	premiumPricing?: RobloxCatalogApiPremiumPricingModel
	/**
	 * The item's lowest price, only if the item is resellable and there are resellers.
	 * @format int64
	 */
	lowestPrice?: number
	/**
	 * The item's lowest resale price, only if the item is resellable and there are resellers, including current user.
	 * @format int64
	 */
	lowestResalePrice?: number
	/** The localized string item status if the item's price should not be displayed. */
	priceStatus?: string
	/**
	 * The number of items in stock, only if the item is resellable and is limitedEdition
	 * @format int64
	 */
	unitsAvailableForConsumption?: number
	/**
	 * The number of times the item has been purchased.
	 * @format int64
	 */
	purchaseCount?: number
	/**
	 * The number of times the item has been favorited.
	 * @format int64
	 */
	favoriteCount?: number
	/**
	 * When the item will go off sale, if the item has an off deadline.
	 * @format date-time
	 */
	offSaleDeadline?: string
	/**
	 * The item's collectible item id.
	 * It is an UUID if a item is collectible type. Otherwise, it is null.
	 */
	collectibleItemId?: string
	/**
	 * The collectible or limited-unique item's total quantity of unique instances.
	 * @format int64
	 */
	totalQuantity?: number
	/**
	 * The sale location type of the item. ['NotApplicable' = 0, 'ShopOnly' = 1, 'MyExperiencesOnly' = 2, 'ShopAndMyExperiences' = 3, 'ExperiencesById' = 4, 'ShopAndAllExperiences' = 5, 'ExperiencesDevApiOnly' = 6, 'ShopAndExperiencesById' = 7]
	 * @format int32
	 */
	saleLocationType?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
	/** An indicator if the item has resellers or not (null if not resellable). */
	hasResellers?: boolean
	/** An indicator if the item is off sale or not. */
	isOffSale?: boolean
	/**
	 * Quantity limit for how many instances a user can buy.
	 * @format int32
	 */
	quantityLimitPerUser?: number
}

export interface RobloxCatalogApiCollectibleItemDetail {
	collectibleItemId?: string
	collectibleProductId?: string
	/** @format int64 */
	price?: number
	/** @format int64 */
	lowestPrice?: number
	/** @format int64 */
	lowestResalePrice?: number
	/** @format int64 */
	totalQuantity?: number
	/** @format int64 */
	unitsAvailable?: number
	/** SaleLocation information for a collectible item (asset or bundle). */
	saleLocation?: RobloxCatalogApiSaleLocation
	hasResellers?: boolean
	/**
	 *  ['Invalid' = 0, 'Draft' = 1, 'OffSale' = 2, 'OnSale' = 3, 'PendingSale' = 4]
	 * @format int32
	 */
	saleStatus?: 0 | 1 | 2 | 3 | 4
	/** @format int32 */
	quantityLimitPerUser?: number
	/** @format date-time */
	offSaleDeadline?: string
	/**
	 * The type of collectible item, limited or non-limited for now. ['Invalid' = 0, 'Limited' = 1, 'NonLimited' = 2]
	 * @format int32
	 */
	collectibleItemType?: 0 | 1 | 2
	lowestAvailableResaleProductId?: string
	lowestAvailableResaleItemInstanceId?: string
	/**
	 *  ['Invalid' = 0, 'None' = 1, 'Disabled' = 2]
	 * @format int32
	 */
	resaleRestriction?: 0 | 1 | 2
}

/** A response containing favorited bundles and whether there are more. */
export interface RobloxCatalogApiFavoriteBundlesResponse {
	/** Collection of favorited bundles and associated details. */
	favorites?: RobloxCatalogApiBundleDetailsModel[]
	/** True if there exists a next page of favorited bundles. */
	moreFavorites?: boolean
	/** Pagination cursor for the next page. */
	nextCursor?: string
	/** Pagination cursor for the previous page. */
	previousCursor?: string
}

export interface RobloxCatalogApiMultigetItemDetailsRequestItem {
	/**
	 *  ['Asset' = 1, 'Bundle' = 2]
	 * @format int32
	 */
	itemType?: 1 | 2
	/** @format int64 */
	id?: number
}

export interface RobloxCatalogApiMultigetItemDetailsRequestModel {
	items?: RobloxCatalogApiMultigetItemDetailsRequestItem[]
}

/** A model to represent owned bundles. */
export interface RobloxCatalogApiOwnedBundleModel {
	/** @format int64 */
	id?: number
	name?: string
	bundleType?: string
	creator?: RobloxCatalogApiBundleCreatorModel
}

/** Defines the Premium pricing for a catalog item */
export interface RobloxCatalogApiPremiumPricingModel {
	/**
	 * The Premium discount percentage for a catalog item
	 * @format int32
	 */
	premiumDiscountPercentage?: number
	/**
	 * The Premium price for a catalog item
	 * @format int64
	 */
	premiumPriceInRobux?: number
}

/** SaleLocation information for a collectible item (asset or bundle). */
export interface RobloxCatalogApiSaleLocation {
	/**
	 *  ['NotApplicable' = 0, 'ShopOnly' = 1, 'MyExperiencesOnly' = 2, 'ShopAndMyExperiences' = 3, 'ExperiencesById' = 4, 'ShopAndAllExperiences' = 5, 'ExperiencesDevApiOnly' = 6, 'ShopAndExperiencesById' = 7]
	 * @format int32
	 */
	saleLocationType?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
	/** @format int32 */
	saleLocationTypeId?: number
	universeIds?: number[]
	enabledUniverseIds?: number[]
}

/** Response model for avatar topics */
export interface RobloxCatalogApiTopicsTopicModel {
	/** The display topic name. */
	displayName?: string
	/** The original topic name stored in the table. */
	originalTopicName?: string
}

export interface RobloxCatalogApiTopicsTopicRequestModel {
	items?: RobloxMarketplacetopicdiscoveryTopicdiscoveryserviceV1Beta1AvatarItem[]
	selectTopics?: string[]
	inputQuery?: string
	/**
	 * Maximum number of topic results returned from the server.
	 * @format int32
	 */
	maxResult?: number
	/**
	 *  ['Unknown' = 1, 'Male' = 2, 'Female' = 3]
	 * @format int32
	 */
	genderType?: 1 | 2 | 3
}

export interface RobloxCatalogApiTopicsTopicResponse {
	topics?: RobloxCatalogApiTopicsTopicModel[]
	error?: RobloxMarketplacetopicdiscoveryTopicdiscoveryserviceV1Beta1Error
}

export interface RobloxMarketplacetopicdiscoveryTopicdiscoveryserviceV1Beta1AvatarItem {
	/** @format int64 */
	TargetId?: number
	/**
	 *  ['Invalid' = 0, 'Asset' = 1, 'Bundle' = 2]
	 * @format int32
	 */
	ItemType?: 0 | 1 | 2
}

export interface RobloxMarketplacetopicdiscoveryTopicdiscoveryserviceV1Beta1Error {
	Message?: string
	/** @format int32 */
	Code?: number
}

export type RobloxWebWebAPIApiEmptyResponseModel = object

export interface RobloxPagingExclusiveStartKeyCursorSystemNullableSystemInt64 {
	/** @format int64 */
	key?: number
	/**
	 *  ['Asc' = 1, 'Desc' = 2]
	 * @format int32
	 */
	sortOrder?: 1 | 2
	/**
	 *  ['Forward' = 1, 'Backward' = 2]
	 * @format int32
	 */
	pagingDirection?: 1 | 2
	/** @format int32 */
	pageNumber?: number
	discriminator?: string
	/** @format int32 */
	count?: number
}

export interface RobloxPlatformCoreExclusiveStartPagingIExclusiveStartKeyInfoRobloxPlatformBundlesCoreIBundleInstance {
	/**
	 *  ['Asc' = 1, 'Desc' = 2]
	 * @format int32
	 */
	SortOrder?: 1 | 2
	/**
	 *  ['Forward' = 1, 'Backward' = 2]
	 * @format int32
	 */
	PagingDirection?: 1 | 2
	/** @format int32 */
	Count?: number
}

export interface RobloxPlatformCoreExclusiveStartPagingIExclusiveStartKeyInfoSystemInt64 {
	/**
	 *  ['Asc' = 1, 'Desc' = 2]
	 * @format int32
	 */
	SortOrder?: 1 | 2
	/**
	 *  ['Forward' = 1, 'Backward' = 2]
	 * @format int32
	 */
	PagingDirection?: 1 | 2
	/** @format int32 */
	Count?: number
}

export interface RobloxWebWebAPIExclusiveStartRequestRobloxPlatformBundlesCoreIBundleInstance {
	ExclusiveStartKeyInfo?: RobloxPlatformCoreExclusiveStartPagingIExclusiveStartKeyInfoRobloxPlatformBundlesCoreIBundleInstance
	CursorRecipe?: string
}

export interface RobloxWebWebAPIExclusiveStartRequestSystemInt64 {
	ExclusiveStartKeyInfo?: RobloxPlatformCoreExclusiveStartPagingIExclusiveStartKeyInfoSystemInt64
	CursorRecipe?: string
}

export interface RobloxWebWebAPIModelsApiArrayResponseRobloxCatalogApiBundleDetailsModel {
	data?: RobloxCatalogApiBundleDetailsModel[]
}

export interface RobloxWebWebAPIModelsApiArrayResponseRobloxCatalogApiCatalogSearchDetailedResponseItem {
	data?: RobloxCatalogApiCatalogSearchDetailedResponseItem[]
}

export interface RobloxWebWebAPIModelsApiPageResponseRobloxCatalogApiBundleDetailsModel {
	previousPageCursor?: string
	nextPageCursor?: string
	data?: RobloxCatalogApiBundleDetailsModel[]
}

export interface RobloxWebWebAPIModelsApiPageResponseRobloxCatalogApiOwnedBundleModel {
	previousPageCursor?: string
	nextPageCursor?: string
	data?: RobloxCatalogApiOwnedBundleModel[]
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
	public baseUrl: string = 'https://catalog.roblox.com'
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
 * @title Catalog Api v1
 * @version v1
 * @baseUrl https://catalog.roblox.com
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
	v1 = {
		/**
		 * No description
		 *
		 * @tags Category
		 * @name AssetToCategoryList
		 * @summary Lists a mapping for assets to category IDs to convert from inventory ID to catalog ID. Creates a mapping to link 'Get More' button in inventory page to the relevant catalog page.
		 * @request GET:/v1/asset-to-category
		 */
		assetToCategoryList: (params: RequestParams = {}) =>
			this.request<Record<string, number>, any>({
				path: `/v1/asset-to-category`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Category
		 * @name AssetToSubcategoryList
		 * @summary Lists a mapping for assets to subcategory IDs to convert from inventory ID to catalog ID. Creates a mapping to link 'Get More' button in inventory page to the relevant catalog page.
		 * @request GET:/v1/asset-to-subcategory
		 */
		assetToSubcategoryList: (params: RequestParams = {}) =>
			this.request<Record<string, number>, any>({
				path: `/v1/asset-to-subcategory`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Bundle
		 * @name AssetsBundlesDetail
		 * @summary Lists the bundles a particular asset belongs to. Use the Id of the last bundle in the response to get the next page.
		 * @request GET:/v1/assets/{assetId}/bundles
		 */
		assetsBundlesDetail: (
			assetId: number,
			query?: {
				/**
				 * The number of results per request.
				 * @format int32
				 * @default 10
				 */
				limit?: 10 | 25 | 50 | 100
				/** The paging cursor for the previous or next page. */
				cursor?: string
				/**
				 * The order the results are sorted in.
				 * @default "Asc"
				 */
				sortOrder?: 'Asc' | 'Desc'
			},
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIModelsApiPageResponseRobloxCatalogApiBundleDetailsModel, void>({
				path: `/v1/assets/${assetId}/bundles`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Bundle
		 * @name BundlesDetailsDetail
		 * @summary Returns details about the given bundleId.
		 * @request GET:/v1/bundles/{bundleId}/details
		 */
		bundlesDetailsDetail: (bundleId: number, params: RequestParams = {}) =>
			this.request<RobloxCatalogApiBundleDetailsModel, void>({
				path: `/v1/bundles/${bundleId}/details`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
 * No description
 *
 * @tags Bundle
 * @name BundlesRecommendationsDetail
 * @summary Gets recommendations for a given bundle, bundleId of 0 returns randomized bundles
- Accepts both public and authenticated users
 * @request GET:/v1/bundles/{bundleId}/recommendations
 */
		bundlesRecommendationsDetail: (
			bundleId: number,
			query?: {
				/**
				 * The number of recommended items to return.
				 * @format int32
				 * @default 20
				 */
				numItems?: number
			},
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIModelsApiArrayResponseRobloxCatalogApiBundleDetailsModel, void>({
				path: `/v1/bundles/${bundleId}/recommendations`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Bundle
		 * @name BundlesDetailsList
		 * @summary Returns details about the given bundleIds.
		 * @request GET:/v1/bundles/details
		 */
		bundlesDetailsList: (
			query: {
				bundleIds: number[]
			},
			params: RequestParams = {}
		) =>
			this.request<RobloxCatalogApiBundleDetailsModel[], void>({
				path: `/v1/bundles/details`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Category
		 * @name CategoriesList
		 * @summary Lists Category Names and their Ids
		 * @request GET:/v1/categories
		 */
		categoriesList: (params: RequestParams = {}) =>
			this.request<Record<string, number>, any>({
				path: `/v1/categories`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesAssetsCountDetail
		 * @summary Gets the favorite count for the given asset Id.
		 * @request GET:/v1/favorites/assets/{assetId}/count
		 */
		favoritesAssetsCountDetail: (assetId: number, params: RequestParams = {}) =>
			this.request<number, void>({
				path: `/v1/favorites/assets/${assetId}/count`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesBundlesCountDetail
		 * @summary Gets the favorite count for the given bundle Id.
		 * @request GET:/v1/favorites/bundles/{bundleId}/count
		 */
		favoritesBundlesCountDetail: (bundleId: number, params: RequestParams = {}) =>
			this.request<number, void>({
				path: `/v1/favorites/bundles/${bundleId}/count`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesUsersAssetsFavoriteDelete
		 * @summary Delete a favorite for an asset by the authenticated user.
		 * @request DELETE:/v1/favorites/users/{userId}/assets/{assetId}/favorite
		 */
		favoritesUsersAssetsFavoriteDelete: (
			userId: number,
			assetId: number,
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIApiEmptyResponseModel, void>({
				path: `/v1/favorites/users/${userId}/assets/${assetId}/favorite`,
				method: 'DELETE',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesUsersAssetsFavoriteDetail
		 * @summary Gets the favorite model for the asset and user.
		 * @request GET:/v1/favorites/users/{userId}/assets/{assetId}/favorite
		 */
		favoritesUsersAssetsFavoriteDetail: (
			userId: number,
			assetId: number,
			params: RequestParams = {}
		) =>
			this.request<RobloxCatalogApiAssetFavoriteModel, void>({
				path: `/v1/favorites/users/${userId}/assets/${assetId}/favorite`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesUsersAssetsFavoriteCreate
		 * @summary Create a favorite for an asset by the authenticated user.
		 * @request POST:/v1/favorites/users/{userId}/assets/{assetId}/favorite
		 */
		favoritesUsersAssetsFavoriteCreate: (
			userId: number,
			assetId: number,
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIApiEmptyResponseModel, void>({
				path: `/v1/favorites/users/${userId}/assets/${assetId}/favorite`,
				method: 'POST',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesUsersBundlesFavoriteDelete
		 * @summary Delete favorite for the bundle by the authenticated user.
		 * @request DELETE:/v1/favorites/users/{userId}/bundles/{bundleId}/favorite
		 */
		favoritesUsersBundlesFavoriteDelete: (
			userId: number,
			bundleId: number,
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIApiEmptyResponseModel, void>({
				path: `/v1/favorites/users/${userId}/bundles/${bundleId}/favorite`,
				method: 'DELETE',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesUsersBundlesFavoriteDetail
		 * @summary Gets the favorite model for the bundle and user.
		 * @request GET:/v1/favorites/users/{userId}/bundles/{bundleId}/favorite
		 */
		favoritesUsersBundlesFavoriteDetail: (
			userId: number,
			bundleId: number,
			params: RequestParams = {}
		) =>
			this.request<RobloxCatalogApiBundleFavoriteModel, void>({
				path: `/v1/favorites/users/${userId}/bundles/${bundleId}/favorite`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Favorites
		 * @name FavoritesUsersBundlesFavoriteCreate
		 * @summary Create a favorite for the bundle by the authenticated user.
		 * @request POST:/v1/favorites/users/{userId}/bundles/{bundleId}/favorite
		 */
		favoritesUsersBundlesFavoriteCreate: (
			userId: number,
			bundleId: number,
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIApiEmptyResponseModel, void>({
				path: `/v1/favorites/users/${userId}/bundles/${bundleId}/favorite`,
				method: 'POST',
				format: 'json',
				...params
			}),

		/**
 * No description
 *
 * @tags Favorites
 * @name FavoritesUsersFavoritesBundlesDetail
 * @summary Lists the bundles favorited by a given user with the given bundle subtypeId.
After 5/31/2024, only cursor based pagination will be supported.
 * @request GET:/v1/favorites/users/{userId}/favorites/{subtypeId}/bundles
 */
		favoritesUsersFavoritesBundlesDetail: (
			userId: number,
			subtypeId: number,
			query?: {
				/**
				 * @format int32
				 * @default 1
				 */
				pageNumber?: number
				/**
				 * @format int32
				 * @default 24
				 */
				itemsPerPage?: number
				cursor?: string
				/** @default false */
				isPrevious?: boolean
			},
			params: RequestParams = {}
		) =>
			this.request<RobloxCatalogApiFavoriteBundlesResponse, void>({
				path: `/v1/favorites/users/${userId}/favorites/${subtypeId}/bundles`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Category
		 * @name SubcategoriesList
		 * @summary Lists Subcategory Names and their Ids
		 * @request GET:/v1/subcategories
		 */
		subcategoriesList: (params: RequestParams = {}) =>
			this.request<Record<string, number>, any>({
				path: `/v1/subcategories`,
				method: 'GET',
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Bundle
		 * @name UsersBundlesDetail
		 * @summary Lists the bundles owned by a given user.
		 * @request GET:/v1/users/{userId}/bundles
		 */
		usersBundlesDetail: (
			userId: number,
			query?: {
				/**
				 * The number of results per request.
				 * @format int32
				 * @default 10
				 */
				limit?: 10 | 25 | 50 | 100
				/** The paging cursor for the previous or next page. */
				cursor?: string
				/**
				 * Sorted by bundle
				 * @default "Asc"
				 */
				sortOrder?: 'Asc' | 'Desc'
			},
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIModelsApiPageResponseRobloxCatalogApiOwnedBundleModel, void>({
				path: `/v1/users/${userId}/bundles`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Bundle
		 * @name UsersBundlesDetail2
		 * @request GET:/v1/users/{userId}/bundles/{bundleType}
		 * @originalName usersBundlesDetail
		 * @duplicate
		 */
		usersBundlesDetail2: (
			userId: number,
			bundleType: 1 | 2 | 3 | 4,
			query?: {
				/**
				 * The number of results per request.
				 * @format int32
				 * @default 10
				 */
				limit?: 10 | 25 | 50 | 100
				/** The paging cursor for the previous or next page. */
				cursor?: string
				/**
				 * The order the results are sorted in.
				 * @default "Desc"
				 */
				sortOrder?: 'Asc' | 'Desc'
			},
			params: RequestParams = {}
		) =>
			this.request<RobloxWebWebAPIModelsApiPageResponseRobloxCatalogApiOwnedBundleModel, any>({
				path: `/v1/users/${userId}/bundles/${bundleType}`,
				method: 'GET',
				query: query,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Catalog
		 * @name CatalogItemsDetailsCreate
		 * @summary Returns list of item details.
		 * @request POST:/v1/catalog/items/details
		 */
		catalogItemsDetailsCreate: (
			model: RobloxCatalogApiMultigetItemDetailsRequestModel,
			params: RequestParams = {}
		) =>
			this.request<
				RobloxWebWebAPIModelsApiArrayResponseRobloxCatalogApiCatalogSearchDetailedResponseItem,
				void
			>({
				path: `/v1/catalog/items/details`,
				method: 'POST',
				body: model,
				type: ContentType.Json,
				format: 'json',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags TopicDiscovery
		 * @name TopicGetTopicsCreate
		 * @request POST:/v1/topic/get-topics
		 */
		topicGetTopicsCreate: (
			model: RobloxCatalogApiTopicsTopicRequestModel,
			params: RequestParams = {}
		) =>
			this.request<RobloxCatalogApiTopicsTopicResponse, void>({
				path: `/v1/topic/get-topics`,
				method: 'POST',
				body: model,
				type: ContentType.Json,
				format: 'json',
				...params
			})
	}
}
