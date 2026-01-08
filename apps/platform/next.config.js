/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ai-editor', '@repo/cms', '@repo/commerce', '@repo/ui'],
  output: 'standalone', // Enable standalone output for Docker
};

module.exports = nextConfig;


