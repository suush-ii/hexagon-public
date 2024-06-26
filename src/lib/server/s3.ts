import { env } from '$env/dynamic/private'

import { S3Client } from '@aws-sdk/client-s3'

export const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${env.CLOUDFLARE_S3_ACCOUNT_ID as string}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.CLOUDFLARE_S3_ACCESS_KEY_ID as string,
		secretAccessKey: env.CLOUDFLARE_S3_ACCESS_KEY as string
	}
})
