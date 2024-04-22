import * as Sentry from '@sentry/sveltekit'

// If you don't want to use Session Replay, remove the `Replay` integration,
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
Sentry.init({
	dsn: 'https://c9543d19a6acc39bb47247c97d9fca37@o4506000665542656.ingest.us.sentry.io/4507127264509952',
	tracesSampleRate: 1,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	integrations: [Sentry.replayIntegration()]
})

export const handleError = Sentry.handleErrorWithSentry()
