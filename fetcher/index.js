// getMinecraftVersions
function getMinecraftVersions() {
    return new Promise((resolve, reject) => {
        var mcversions = [];
        console.log('getVersions running:');
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

// getting scripts
// vanilla
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


// future plans
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


// DATABASE STUFF!!!
// ill use sqlite for now but will use a proper hosted DB in the future when everything is in containers :P

// things to do:
// - table for each server type, and table to store all the types
//   - in each server type table, store the version and download url for each version

// each hour, update the database with the latest versions of each server type by using the functions to fetch them
// the database will be read by the frontend to display the latest versions of each server type

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('servers.db');


// create all the tables (help idk what im doing i hate sql)
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS server_types (type TEXT PRIMARY KEY)');
    db.run('CREATE TABLE IF NOT EXISTS vanilla (version TEXT PRIMARY KEY, download_url TEXT)');
    // db.run('CREATE TABLE IF NOT EXISTS paper (version TEXT PRIMARY KEY, download_url TEXT)');
    // db.run('CREATE TABLE IF NOT EXISTS purpur (version TEXT PRIMARY KEY, download_url TEXT)');
    // db.run('CREATE TABLE IF NOT EXISTS spigot (version TEXT PRIMARY KEY, download_url TEXT)');
    // db.run('CREATE TABLE IF NOT EXISTS bukkit (version TEXT PRIMARY KEY, download_url TEXT)');
    // db.run('CREATE TABLE IF NOT EXISTS forge (version TEXT PRIMARY KEY, download_url TEXT)');
});




