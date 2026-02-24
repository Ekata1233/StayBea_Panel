/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["ik.imagekit.io"], // ✅ Allow ImageKit
  },
};

export default nextConfig;
