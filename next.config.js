/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        // Seemed to solve some of the issues with Fast Refresh but I've gotten used to the timely updates...
        // config.watchOptions = {
        //     poll: 2000,
        //     aggregateTimeout: 1000,
        // };
        return config;
    },
    experimental: {
        serverActions: true,
    },
};

module.exports = nextConfig;
