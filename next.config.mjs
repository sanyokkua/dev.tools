import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: true,
    reloadOnOnline: true,
    workboxOptions: {
        disableDevLogs: true,
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        exclude: [/dynamic-css-manifest\.json/],
    },
});

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = '';
let basePath = '';

if (isGithubActions) {
    // Trim off `<owner>/`
    // @ts-expect-error can't happen on GitHub Action
    const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '');
    assetPrefix = `/${repo}/`;
    basePath = `/${repo}`;
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    /* config options here */
    reactStrictMode: true,
    output: 'export',
    assetPrefix: assetPrefix,
    basePath: basePath,
    env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

const isProd = process.env.NODE_ENV === 'production';
export default isProd ? withPWA(nextConfig) : nextConfig;
