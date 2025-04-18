/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "i.ytimg.com",
      "yt3.googleusercontent.com",
      "lh3.googleusercontent.com",
      "img.youtube.com",
    ],
  },

  // 세션 관리 관련 설정
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

module.exports = nextConfig;
