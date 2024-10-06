function getMinecraftVersions() {
    return new Promise((resolve, reject) => {
        var mcversions = [];
        console.log('getting minecraft versions');
        url = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                versions = data.versions;
                versions.forEach(version => {
                    if (version.type === 'release') {
                        mcversions.push({"version":version.id.toString(), "url":version.url.toString()}); // Add the version to the results
                    }
                });
                resolve(mcversions); // Resolve the promise with the results
            })
            .catch(error => {
                console.log('error:', error);
                resolve(mcversions); // Resolve the promise even if there's an error
            });
    });
}

minecraftversions = getMinecraftVersions()


async function getVanillaServerURLs() {
    const vanillaServerURLs = [];
    const mcversions = await minecraftversions;

    for (const version of mcversions) {
        try {

            const response = await fetch(version.url);
            const data = await response.json();
            vanillaServerURLs.push({"version": version.version, "downloadURL": data.downloads.server.url});

        } catch (error) {
            console.log(`error getting ${version.url}:`, error);
        }
    }
    return vanillaServerURLs;
}

// paper
async function getPaperServerURLs() {
    // data structure: {version: "1.16.4", builds: [{build: 1, downloadURL: "something"}, {build: 2, downloadURL: "somethingelse"}]}
    const paperServerURLs = [];
    const paperURL = "https://api.papermc.io/v2/projects/paper";
    console.log('[getPaperServerURLs] Fetching Paper Server URLs');

    try {
        const response = await fetch(paperURL);
        const data = await response.json();
        const fetchPromises = data.versions.map(async (version) => {
            const fetchedBuilds = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}`);
            const builds = (await fetchedBuilds.json()).builds;

            const buildsData = builds.map(build => ({
                build: build,
                downloadURL: `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}/downloads/paper-${version}-${build}.jar`
            }));

            return { version: version, builds: buildsData };
        });

        const results = await Promise.all(fetchPromises);
        paperServerURLs.push(...results);

        console.log('[getPaperServerURLs] Finished Fetching Paper Server URLs');
    } catch (error) {
        console.error('[getPaperServerURLs] Error: ', error);
    }

    return paperServerURLs;
}

// purpur
async function getPurpurServerURLs() {
    const purpurServerURLs = [];
    const purpurURL = "https://api.purpurmc.org/v2/purpur";
    console.log('[getPurpurServerURLs] Fetching Purpur Server URLs');

    try {
        const response = await fetch(purpurURL);
        const data = await response.json();
        const purpurVersions = data.versions;

        const fetchPromises = purpurVersions.map(async (version) => {
            const fetchedBuilds = await fetch(`https://api.purpurmc.org/v2/purpur/${version}`);
            const builds = (await fetchedBuilds.json()).builds.all;

            const buildsData = builds.map(buildNumber => ({
                build: buildNumber,
                downloadURL: `https://api.purpurmc.org/v2/purpur/${version}/${buildNumber}/download`
            }));

            return { version: version, builds: buildsData };
        });

        const results = await Promise.all(fetchPromises);
        purpurServerURLs.push(...results);

        console.log('[getPaperServerURLs] Finished Fetching Paper Server URLs');
    } catch (error) {
        console.error('[getPaperServerURLs] Error: ', error);
    }

    return purpurServerURLs;
}

// spigot
async function getSpigotServerURLs() {
    return null
}

// bukkit
async function getBukkitServerURLs() {
    return null
}

// forge
async function getForgeServerURLs() {
    return null
}


async function getServerURLs() {
    func1 = await getPaperServerURLs();
    console.log(func1);
}

getServerURLs();