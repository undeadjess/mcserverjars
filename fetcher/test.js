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
    return null
}

// purpur
async function getPurpurServerURLs() {
    return null
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