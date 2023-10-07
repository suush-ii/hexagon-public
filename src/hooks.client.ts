import { handleErrorWithSentry, Replay } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';

Sentry.init({
	dsn: 'https://4d1e802039697045efc6ed728b2bf873@o4506000665542656.ingest.sentry.io/4506000666591232',
	tracesSampleRate: 1.0,

	// This sets the sample rate to be 100%. to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: dev === true ? 1 : 0.1,

	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	replaysOnErrorSampleRate: 1.0,

	// If you don't want to use Session Replay, just remove the line below:
	integrations: [new Replay()],
	environment: dev === true ? 'dev' : 'production'
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
