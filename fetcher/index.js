const mysql = require('mysql');
// const dotenv = require('dotenv');
// dotenv.config({ path: '../.env' });

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;




// get a list of minecraft versions
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



// server scripts
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



// database setup
var con = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE TABLE IF NOT EXISTS server_types (type VARCHAR(255) PRIMARY KEY)", function (err, result) {
        if (err) throw err;
        console.log("server_types table created");
    });
    con.query("CREATE TABLE IF NOT EXISTS vanilla (version VARCHAR(255) PRIMARY KEY, download_url TEXT)", function (err, result) {
        if (err) throw err;
        console.log("vanilla table created");
    });
    // run initially
    updateDatabase()
    // run every hour
    setInterval(updateDatabase, 3600000)
});



function updateDatabase() {
    console.log('updating database');


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
}



