/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase
      {
        protocol: "https",
        hostname: "urunpeifuloeerxbteve.supabase.co",
        pathname: "/storage/v1/object/public/users/**",
      },
      // YouTube 썸네일 (i.ytimg.com)
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      // YouTube 채널 썸네일 (yt3)
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
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
