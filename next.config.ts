import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  /* config options here */
}

export default withSentryConfig(nextConfig, {
  // Suppress Sentry build output
  silent: true,
  // Without SENTRY_AUTH_TOKEN, source map upload is a no-op — build still succeeds
  authToken: process.env.SENTRY_AUTH_TOKEN,
})
