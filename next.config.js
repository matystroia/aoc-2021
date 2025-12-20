/** @type {import('next').NextConfig} */
const nextConfig = {
    // webpack: (config) => {
    //     config.experiments = { ...config.experiments, topLevelAwait: true };
    //     return config;
    // },
    turbopack: {},
    basePath: "",
};

const withMDX = require("@next/mdx")({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [],
        rehypePlugins: [['rehype-pretty-code', {}]],
    },
});

module.exports = withMDX(nextConfig);
