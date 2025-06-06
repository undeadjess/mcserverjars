const semver = require("semver");
const baseURL = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
let cached = null;

// Prefetch and cache the full structure
async function preload() {
    if (cached) return cached;
    const versionsResponse = await fetch(baseURL);
    const versionsData = await versionsResponse.json();
    const mcversions = versionsData.versions.filter(
        (version) => version.type === "release"
    );
    const versionPromises = mcversions.map(async (version) => {
        try {
            const response = await fetch(version.url);
            const data = await response.json();
            const builds = data.downloads.server?.url
                ? [
                      {
                          build: 1, // vanilla only has one build
                          downloadURL: data.downloads.server.url,
                      },
                  ]
                : [];
            return { version: version.id, builds };
        } catch (error) {
            console.log(`[preload] error getting ${version.url}:`, error);
            return { version: version.id, builds: [] };
        }
    });
    const all = await Promise.all(versionPromises);
    cached = all.filter((entry) => entry.builds.length > 0);
    return cached;
}

module.exports = {
    getVersions: async () => {
        const data = await preload();
        return data
            .map((v) => v.version)
            .sort((a, b) =>
                semver.rcompare(semver.coerce(a), semver.coerce(b))
            );
    },

    getBuilds: async (version) => {
        const data = await preload();
        const entry = data.find((v) => v.version === version);
        if (!entry) throw new Error(`Version ${version} not found`);
        return entry.builds.map((b) => b.build).sort((a, b) => b - a);
    },

    getDownloadURL: async (version, build) => {
        const data = await preload();
        const entry = data.find((v) => v.version === version);
        if (!entry) throw new Error(`Version ${version} not found`);
        const buildEntry = entry.builds.find(
            (b) => Number(b.build) === Number(build)
        );
        if (!buildEntry)
            throw new Error(`Build ${build} not found for version ${version}`);
        return buildEntry.downloadURL;
    },
    getLatest: async () => {
        const data = await preload();
        if (data.length === 0) throw new Error("No versions available");

        const sortedVersions = data
            .map((v) => v.version)
            .sort((a, b) =>
                semver.rcompare(semver.coerce(a), semver.coerce(b))
            );
        const latestVersion = sortedVersions[0];
        const versionEntry = data.find((v) => v.version === latestVersion);

        const latestBuild = Math.max(
            ...versionEntry.builds.map((b) => b.build)
        );
        const buildEntry = versionEntry.builds.find(
            (b) => b.build === latestBuild
        );

        return {
            server: "vanilla",
            version: latestVersion,
            build: latestBuild,
            downloadURL: buildEntry.downloadURL,
        };
    },
};
