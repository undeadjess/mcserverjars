const { json } = require("body-parser");
const express = require("express");
const app = express();
const mysql = require("mysql");

const port = process.env.LISTEN_PORT || 3000;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

// mysql connection pool
var con = mysql.createPool({
    connectionLimit: 10,
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
});

// get valid servers from database
let validServers = [];

function getValidServers() {
    return new Promise((resolve, reject) => {
        // get all server types from database
        con.query("SELECT type FROM server_types", function (err, result) {
            if (err) {
                console.log("[getValidServers] error getting servers:", err);
                return reject(err);
            }
            if (result.length === 0) {
                console.log(
                    "[getValidServers] no servers found, trying again in 5 seconds"
                );
                setTimeout(() => {
                    resolve(getValidServers());
                }, 5000);
            } else {
                console.log("[getValidServers] got valid servers");
                resolve(result.map((row) => row.type));
            }
        });
    });
}

async function initialize() {
    while (true) {
        try {
            // connect to mysql
            await new Promise((resolve, reject) => {
                con.getConnection((err, connection) => {
                    if (err) {
                        console.log(
                            "[initialize] error connecting to mysql:",
                            err
                        );
                        reject(err);
                    } else {
                        console.log("[initialize] connected to mysql");
                        resolve(connection);
                    }
                });
            });

            console.log("[initialize] initializing server");
            validServers = await getValidServers();
            console.log("[initialize] using fetched servers:", validServers);
            app.listen(port, () => {
                console.log(`[initialize] server listening on port ${port}`);
            });
            console.log("[initialize] server initialized");
            // exit the loop if connection worked
            break;
        } catch (error) {
            console.error("[initialize] Error initializing server:", error);
            console.log("[initialize] retrying in 5 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}

initialize();

// routes
app.get("/", (req, res) => {
    console.log(
        "[routes] New request to",
        req.path,
        " from IP address:",
        req.ip
    );
    res.json({ types: ["servers", "proxys"] });
});

app.get("/servers", (req, res) => {
    console.log(
        "[routes] New request to",
        req.path,
        " from IP address:",
        req.ip
    );
    res.json({servers: validServers});
});

app.get("/servers/:server/:version?/:build?", (req, res) => {
    console.log(
        "[routes] New request to",
        req.path,
        " from IP address:",
        req.ip
    );
    const { server, version, build } = req.params;

    // get server URL. if version and build are not provided, pass nothing to the function
    getServerURL(server, version || null, build || null)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.error("[routes] Error fetching server URL:", err);
            res.status(400).json({
                error: "Error fetching server URL. Please check your parameters",
            });
        });
});

// get server URLs from database
function getServerURL(server, version, build) {
    return new Promise((resolve, reject) => {
        // Make sure values are valid to prevent SQL injection
        if (!validServers.includes(server)) {
            return reject({ error: "invalid server" });
        }
        if (version && !version.match(/\d+\.\d+(\.\d+)?/)) {
            return reject({ error: "invalid version" });
        }
        if (build && !build.match(/\d+/)) {
            return reject({ error: "invalid build" });
        }

        // set query and params based on input
        console.log(
            "[getServerURL] getting server urls for",
            server,
            version,
            build
        );
        let queryGetAllBuilds;
        let queryGetAllVersions;

        if (build) {
            queryGetLatest = `SELECT download_url FROM ${server} WHERE version = ? AND build = ?`;
            params = [version, build];
        } else if (version) {
            queryGetLatest = `SELECT download_url FROM ${server} WHERE version = ?`;
            queryGetAllBuilds = `SELECT build FROM ${server} WHERE version = ? ORDER BY CAST(build AS UNSIGNED) DESC`;
            params = [version];
        } else {
            // select the latest version and build - sort by version and build, but treat them as unsigned integers so that they sort correctly.
            queryGetLatest = `
                SELECT download_url 
                FROM ${server}
                WHERE version = (
                    SELECT version 
                    FROM ${server}
                    ORDER BY 
                        CAST(SUBSTRING_INDEX(version, '.', 1) AS UNSIGNED) DESC,
                        CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(version, '.', -2), '.', 1) AS UNSIGNED) DESC,
                        LENGTH(version) DESC,
                        CAST(SUBSTRING_INDEX(version, '.', -1) AS UNSIGNED) DESC 
                    LIMIT 1
                ) 
                ORDER BY 
                    CAST(SUBSTRING_INDEX(build, '.', 1) AS UNSIGNED) DESC,
                    CASE WHEN LENGTH(build) - LENGTH(REPLACE(build, '.', '')) >= 1 THEN CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(build, '.', -2), '.', 1) AS UNSIGNED) ELSE 0 END DESC,
                    CASE WHEN LENGTH(build) - LENGTH(REPLACE(build, '.', '')) = 2 THEN CAST(SUBSTRING_INDEX(build, '.', -1) AS UNSIGNED) ELSE 0 END DESC 
                LIMIT 1;
            `;
            // get just of all versions to display after latest - dont need to sort by build
            queryGetAllVersions = `
                SELECT DISTINCT version FROM ${server}
                ORDER BY 
                    CAST(SUBSTRING_INDEX(version, '.', 1) AS UNSIGNED) DESC,
                    CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(version, '.', 2), '.', -1) AS UNSIGNED) DESC,
                    LENGTH(version) DESC,
                    CAST(
                        CASE 
                            WHEN SUBSTRING_INDEX(version, '.', -1) = version THEN 0
                            ELSE SUBSTRING_INDEX(version, '.', -1) 
                        END AS UNSIGNED
                    ) DESC;
            `;
            params = [];
        }
        con.query(queryGetLatest, params, function (err, result) {
            if (err) {
                console.log("[getServerURL] error getting server urls:", err);
                return reject(err);
            } else {
                console.log(
                    "[getServerURL] got server urls:",
                    result[0] ? result[0].download_url : null
                );

                // add version and build as latest if they don't exist -- IMPROVE THIS LATER!!!
                // if (!version) version = "latest";
                // if (!build) build = "latest";

                if (!version) {
                    // get the latest version from the result
                    if (result[0]) {
                        version = result[0].version || "latest";
                    } else {
                        return reject({ error: "invalid Version and/or Build" });
                    }
                }

                // if download_url is null, error out
                if (!result[0]) {
                    return reject({ error: "invalid Version and/or Build" });
                }

                let response = {
                    latest: {
                        server: server,
                        version: version,
                        build: build,
                        downloadURL: result[0] ? result[0].download_url : null,
                    },
                };

                // check if either queryGetAllBuilds or queryGetAllVersions are defined, if so fetch them
                if (queryGetAllBuilds) {
                    con.query(
                        queryGetAllBuilds,
                        [version],
                        function (err, builds) {
                            if (err) {
                                console.log(
                                    "[getServerURL] error getting builds:",
                                    err
                                );
                                return reject(err);
                            }
                            console.log(
                                "[getServerURL] DEBUG queryGetAllBuilds is defined"
                            );
                            response.builds = builds.map((b) => b.build);
                            resolve(response);
                        }
                    );
                } else if (queryGetAllVersions) {
                    con.query(queryGetAllVersions, function (err, versions) {
                        if (err) {
                            console.log(
                                "[getServerURL] error getting versions:",
                                err
                            );
                            return reject(err);
                        }
                        console.log(
                            "[getServerURL] DEBUG queryGetAllVersions is defined"
                        );
                        response.versions = versions.map((v) => v.version);
                        resolve(response);
                    });
                } else {
                    resolve(response); // basically just give up and dont give anything (shouldnt happen but just in case :P)
                }
            }
        });
    });
}


