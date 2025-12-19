/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  publicRuntimeConfig: {
    SERVER_NAME: process.env.SERVER_NAME,
  },
};

if (process.env.NODE_ENV === 'production') {
  nextConfig.compiler = {
    removeConsole: {
      exclude: ['error'],
    },
  }
}

export default nextConfig;
