/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "mc-heads.net" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
  webpack: (config) => {
    config.module.rules.forEach((rule) => {
      if (rule.test && rule.test.toString().includes("tsx")) {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach((use) => {
            if (use.loader && use.loader.includes("swc-loader")) {
              use.options = use.options || {};
              use.options.jsc = use.options.jsc || {};
              use.options.jsc.target = "es2017";
            }
          });
        }
      }
    });
    return config;
  },
};

export default nextConfig;
