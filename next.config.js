/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        return config;
    },
    experimental: {
        serverActions: true,
        mdxRs: true,
    },
};

const withMDX = require("@next/mdx")();

module.exports = withMDX(nextConfig);
