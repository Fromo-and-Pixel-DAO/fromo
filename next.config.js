const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'development',
  swcMinify: true,
  async rewrites() {
    return {
      // https://stackoverflow.com/questions/75092485/rewrites-in-next-js-working-fine-in-local-but-not-working-after-deployment-in-v
      beforeFiles: [
        {
          source: `/robots.txt`,
          destination: `/robotstxt`,
        },
        {
          source: `/fl/:path*`,
          destination: `https://pom.wtf/fl/:path*`,
        },
      ],
    }
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: { and: [/\.(js|ts)x?$/] },
      use: ['url-loader'],
    })
    return config
  },
  sassOptions: {
    indentWidth: 4,
    includePaths: [path.join(__dirname, 'src', 'packages')],
    additionalData: "@import 'ui/styles/scale/scale.mixin';",
  },
  publicRuntimeConfig: {
    APP_LOCALE: process.env.APP_LOCALE || 'ru-RU',
    BASE_URL: process.env.BASE_URL,
    SHOP_ID: process.env.SHOP_ID,
    SHOP_URL: process.env.SHOP_URL,
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig
