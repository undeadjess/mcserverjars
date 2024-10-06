const mysql = require('mysql');
// const dotenv = require('dotenv');
// dotenv.config({ path: '../.env' });

// live
// const port = process.env.LISTEN_PORT || 3000;
// const dbHost = process.env.DB_HOST;
// const dbUser = process.env.DB_USER;
// const dbPassword = process.env.DB_PASSWORD;
// const dbName = process.env.DB_NAME;

// testing
const port = 3000;
const dbHost = "192.168.50.2";
const dbUser = "root";
const dbPassword = "ExamplePassword-PleaseChange";
const dbName = "mcserverjars";




// get a list of minecraft versions
function getMinecraftVersions() {
    return new Promise((resolve, reject) => {
        var mcversions = [];
        console.log('[getMinecraftVersions] Fetching minecraft versions');
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
            }).then(() => {
                console.log('[getMinecraftVersions] Finished Fetching Minecraft Versions');

            })
            .catch(error => {
                console.log('[getMinecraftVersions] error:', error);
                resolve(mcversions); // Resolve the promise even if there's an error
            });
    });
}



minecraftversions = getMinecraftVersions()



// server scripts
// vanilla
async function getVanillaServerURLs() {
    const vanillaServerURLs = [];
    console.log('[getVanillaServerURLs] Fetching Vanilla Server URLs');
    const mcversions = await minecraftversions;

    const fetchPromises = mcversions.map(async (version) => {
        try {
            const response = await fetch(version.url);
            const data = await response.json();
            // TODO - do something about the error for minecraft versions with no multiplayer server jar
            return { version: version.version, downloadURL: data.downloads.server.url };
        } catch (error) {
            console.log(`[getVanillaServerURLs] error getting ${version.url}:`, error);
            return null; 
        }
    });

    const results = await Promise.all(fetchPromises);
    const validResults = results.filter(result => result !== null);
    
    console.log('[getVanillaServerURLs] Finished Fetching Vanilla Server URLs');
    return validResults;
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
// Potential DMCA issues exist - see https://github.com/github/dmca/blob/master/2014/2014-09-05-CraftBukkit.md
// Complicated - need to build the server jar
async function getSpigotServerURLs() {
    return null
}

// bukkit
// Potential DMCA issues exist - see https://github.com/github/dmca/blob/master/2014/2014-09-05-CraftBukkit.md
// Complicated - need to build the server jar
async function getBukkitServerURLs() {
    return null
}

// forge
// Complicated - need to build the server jar
async function getForgeServerURLs() {
    return null
}


// fabric
async function getFabricServerURLs() {
    // https://meta.fabricmc.net/v2/versions/loader/1.21.1/0.16.5/1.0.1/server/jar
    // https://meta.fabricmc.net/v2/versions/loader/<Minecraft Version>/<Fabric Loader Version>/<Installer Version>/server/jar

    const fabricServerURLs = [];
    const fabricURL = "https://meta.fabricmc.net/v2/versions/loader";
    console.log('[getFabricServerURLs] Fetching Fabric Server URLs');

    // we will always want the latest installer version...
    async function getLatestInstallerVersion() {
        // https://meta.fabricmc.net/v2/versions/installer
        const installerURL = "https://meta.fabricmc.net/v2/versions/installer";
        try {
            const response = await fetch(installerURL);
            const data = await response.json();
            return data[0].version; // Return the latest installer version
        } catch (error) {
            console.error('[getFabricServerURLs] Error fetching installer version:', error);
            return null; // Return null if there's an error
        }
    }

    // need to get the game versions supported by fabric
    async function getSupportedStableMinecraftVersions() {
        // https://meta.fabricmc.net/v2/versions/game
        const gameURL = "https://meta.fabricmc.net/v2/versions/game";
        const supportedMinecraftVersions = []
        try {
            const response = await fetch(gameURL);
            const data = await response.json();
            data.map(version => {
                // check that stable is true
                if (version.stable) {
                    supportedMinecraftVersions.push(version.version);
                }

            });
        } catch (error) {
            console.error('[getFabricServerURLs] Error fetching supported Minecraft versions:', error);
            return null; // Return null if there's an error
        }
        return supportedMinecraftVersions
    }

    // get fabric loader versions
    async function getFabricLoaderVersions() {
        // https://meta.fabricmc.net/v2/versions/loader
        const loaderURL = "https://meta.fabricmc.net/v2/versions/loader";
        const fabricLoaderVersions = []

        try {
            const response = await fetch(loaderURL);
            const data = await response.json();
            data.map(version => {
                fabricLoaderVersions.push(version.version);
            });
        } catch (error) {
            console.error('[getFabricServerURLs] Error fetching Fabric Loader versions:', error);
            return null; // Return null if there's an error
        }
        return fabricLoaderVersions.sort();
    }


    try {
        const installerVersion = await getLatestInstallerVersion();
        const supportedMinecraftVersions = await getSupportedStableMinecraftVersions();
        const fabricLoaderVersions = await getFabricLoaderVersions();

        // for each supported version, get the server jar
        for (const minecraftVersion of supportedMinecraftVersions) {
            // data structure: {version: "1.16.4", builds: [{build: 1, fabricLoaderVersion: "something", downloadURL: "something"}]}
            const fabricServerURLsForVersion = [];
            let buildCounter = 1;
            for (const fabricLoaderVersion of fabricLoaderVersions) {
                const downloadURL = (`https://meta.fabricmc.net/v2/versions/loader/${minecraftVersion}/${fabricLoaderVersion}/${installerVersion}/server/jar`);

                fabricServerURLsForVersion.push({
                    build: buildCounter++,
                    fabricLoaderVersion: fabricLoaderVersion,
                    downloadURL: downloadURL
                });
                
            }
            fabricServerURLs.push({
                version: minecraftVersion,
                builds: fabricServerURLsForVersion

            });
        }

        console.log('[getFabricServerURLs] Finished Fetching Fabric Server URLs');
    } catch (error) {
        console.error('[getFabricServerURLs] Error: ', error);
    }

    return fabricServerURLs;

};



// database setup
var con = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName
});

con.connect(function(err) {
    if (err) throw err;
    console.log("[database] Connected!");
    con.query("CREATE TABLE IF NOT EXISTS server_types (type VARCHAR(255) PRIMARY KEY)", function (err, result) {
        if (err) throw err;
        console.log("[database] server_types table created");
    });
    con.query("CREATE TABLE IF NOT EXISTS vanilla (version VARCHAR(255) PRIMARY KEY, download_url TEXT)", function (err, result) {
        if (err) throw err;
        console.log("[database] vanilla table created");
    });
    // run initially
    updateDatabase()
    // run every hour
    setInterval(updateDatabase, 3600000)
});



function updateDatabase() {
    console.log('[main] updating database');

    serverTypes = ['vanilla', 'paper', 'purpur', 'spigot', 'bukkit', 'forge'];
    serverTypes.forEach((server) => {
        con.query('INSERT INTO server_types (type) VALUES (?) ON DUPLICATE KEY UPDATE type = ?', [server, server], function (err, result) {
            if (err) throw err;
        });
    });
    // remove invalid servers
    con.query('DELETE FROM vanilla WHERE version NOT IN (SELECT version FROM server_types)', function (err, result) {
        if (err) throw err;
    });


    getVanillaServerURLs().then((vanillaServerURLs) => {
        vanillaServerURLs.forEach((server) => {
            con.query('INSERT INTO vanilla (version, download_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE download_url = ?', [server.version, server.downloadURL, server.downloadURL], function (err, result) {
                if (err) throw err;
            });
        });
    });

    console.log('[main] database updated');
}



