/* eslint-disable import/order */
const rehypePrettyCode = require("rehype-pretty-code");

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        return config;
    },
    experimental: {
        serverActions: true,
        // mdxRs: true,
    },
    basePath: "/aoc",
};

const withMDX = require("@next/mdx")({
    options: {
        rehypePlugins: [[rehypePrettyCode, []]],
    },
});

module.exports = withMDX(nextConfig);
