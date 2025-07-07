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
    react: { useJsx: true },
};

export default nextConfig;
