module.exports = {
    getVersions: () => Promise.resolve(["3.1.2", "3.1.1"]),
    getBuilds: (version) => Promise.resolve(["build1", "build2"]),
    getDownloadURL: (version, build) =>
        Promise.resolve(`https://example.com/velocity/${version}/${build}`)
};
