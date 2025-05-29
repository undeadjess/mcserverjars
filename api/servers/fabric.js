const semver = require("semver");
const baseURL = "https://meta.fabricmc.net/v2/versions";
let cached = null;

// Prefetch and cache the full structure
async function preload() {
  if (cached) return cached;
  
  // Get latest installer version
  async function getLatestInstallerVersion() {
    try {
      const response = await fetch(`${baseURL}/installer`);
      const data = await response.json();
      return data[0].version;
    } catch (error) {
      console.log("[preload] Error fetching installer version:", error);
      return null;
    }
  }

  // Get supported stable Minecraft versions
  async function getSupportedStableMinecraftVersions() {
    try {
      const response = await fetch(`${baseURL}/game`);
      const data = await response.json();
      return data
        .filter(version => version.stable)
        .map(version => version.version);
    } catch (error) {
      console.log("[preload] Error fetching supported Minecraft versions:", error);
      return [];
    }
  }

  // Get Fabric loader versions
  async function getFabricLoaderVersions() {
    try {
      const response = await fetch(`${baseURL}/loader`);
      const data = await response.json();
      return data
        .map(version => version.version)
        .filter(version => {
          // Filter out loader versions below 0.12
          const versionNumbers = version.split(".").map(Number);
          return versionNumbers.length >= 2 && versionNumbers[1] >= 12;
        })
        .sort((a, b) => semver.rcompare(semver.coerce(a), semver.coerce(b)));
    } catch (error) {
      console.log("[preload] Error fetching Fabric Loader versions:", error);
      return [];
    }
  }

  try {
    const installerVersion = await getLatestInstallerVersion();
    const supportedMinecraftVersions = await getSupportedStableMinecraftVersions();
    const fabricLoaderVersions = await getFabricLoaderVersions();

    if (!installerVersion) {
      throw new Error("Could not fetch installer version");
    }

    const versionPromises = supportedMinecraftVersions.map(async (minecraftVersion) => {
      const builds = fabricLoaderVersions.map(fabricLoaderVersion => ({
        build: fabricLoaderVersion,
        downloadURL: `${baseURL}/loader/${minecraftVersion}/${fabricLoaderVersion}/${installerVersion}/server/jar`
      }));

      return { version: minecraftVersion, builds };
    });

    const all = await Promise.all(versionPromises);
    cached = all.filter(entry => entry.builds.length > 0);
    return cached;
  } catch (error) {
    console.log("[preload] Error:", error);
    cached = [];
    return cached;
  }
}

module.exports = {
  getVersions: async () => {
    const data = await preload();
    return data
      .map(v => v.version)
      .sort((a, b) => semver.rcompare(semver.coerce(a), semver.coerce(b)));
  },
  
  getBuilds: async (version) => {
    const data = await preload();
    const entry = data.find(v => v.version === version);
    if (!entry) throw new Error(`Version ${version} not found`);
    return entry.builds
      .map(b => b.build)
      .sort((a, b) => semver.rcompare(semver.coerce(a), semver.coerce(b)));
  },
  
  getDownloadURL: async (version, build) => {
    const data = await preload();
    const entry = data.find(v => v.version === version);
    if (!entry) throw new Error(`Version ${version} not found`);
    const buildEntry = entry.builds.find(b => b.build === build);
    if (!buildEntry) throw new Error(`Build ${build} not found for version ${version}`);
    return buildEntry.downloadURL;
  }
};