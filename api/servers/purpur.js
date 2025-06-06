const semver = require("semver");
const baseURL = "https://api.purpurmc.org/v2/purpur";
let cached = null;

// Prefetch and cache the full structure
async function preload() {
    if (cached) return cached;
    const response = await fetch(baseURL);
    const data = await response.json();
    const purpurVersions = data.versions;
    const versionPromises = purpurVersions.map(async (version) => {
        try {
            const fetchedBuilds = await fetch(`${baseURL}/${version}`);
            const buildsData = await fetchedBuilds.json();
            const builds = buildsData.builds.all.map((buildNumber) => ({
                build: buildNumber,
                downloadURL: `${baseURL}/${version}/${buildNumber}/download`,
            }));
            return { version, builds };
        } catch (error) {
            console.log(
                `[preload] error getting builds for version ${version}:`,
                error
            );
            return { version, builds: [] };
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
            server: "purpur",
            version: latestVersion,
            build: latestBuild,
            downloadURL: buildEntry.downloadURL,
        };
    },
};
