const { json } = require('body-parser');
const express = require('express');
const app = express();
const mysql = require('mysql'); 



const port = process.env.LISTEN_PORT || 3000;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;



// mysql connection
var con = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName
});



// get valid servers from database
let validServers = [];

function getValidServers() {
    return new Promise((resolve, reject) => {
        con.query('SELECT type FROM server_types', function (err, result) {
            if (err) {
                console.log('[getValidServers] error getting servers:', err);
                return reject(err);
            }
            if (result.length === 0) {
                console.log('[getValidServers] no servers found, trying again in 5 seconds');
                setTimeout(() => {
                    resolve(getValidServers());
                }, 5000);
            } else {
                console.log('[getValidServers] got valid servers');
                resolve(result.map(row => row.type));
            }
        });
    });
}



async function initialize() {
    con.connect(function(err) {
        if (err) {
            console.log('[initialize] error connecting to mysql:', err);
            return;
        }
        console.log('[initialize] connected to mysql');
    });
    console.log('[initialize] initializing server');
    try {
        validServers = await getValidServers();
        console.log('[initialize] using fetched servers:', validServers);
        app.listen(port, () => {
            console.log(`[initialize] server listening on port ${port}`);
        });
        console.log('[initialize] server initialized');
    } catch (error) {
        console.error('[initialize] Error initializing server:', error);
    }
}

initialize();



// routes
app.get('/', (req, res) => {
    console.log('[routes] New request to', req.path, " from IP address:", req.ip);
    res.json({"types": ["servers", "proxys"]});
});

app.get('/servers', (req, res) => {
    console.log('[routes] New request to', req.path, " from IP address:", req.ip);
    res.json(validServers);
});

app.get('/servers/:server', (req, res) => {
    console.log('[routes] New request to', req.path, " from IP address:", req.ip);
    const { server } = req.params;
    getServerURL(server, null, null).then((data) => {
        res.json(data);
    });
});

app.get('/servers/:server/:version', (req, res) => {
    console.log('[routes] New request to', req.path, " from IP address:", req.ip);
    const { server, version } = req.params;
    getServerURL(server, version, null).then((data) => {
        res.json(data);
    });
});

app.get('/servers/:server/:version/:build', (req, res) => {
    console.log('[routes] New request to', req.path, " from IP address:", req.ip);
    const { server, version, build } = req.params;
    getServerURL(server, version, build).then((data) => {
        res.json(data);
    });
});



// get server URLs from database
function getServerURL(server, version, build) {
    return new Promise((resolve, reject) => {

        // Make sure values are valid to prevent SQL injection
        if (!(validServers.includes(server))) {
            return resolve({ error: 'invalid server' });
        }
        if (version && !version.match(/\d+\.\d+(\.\d+)?/)) {
            return resolve({ error: 'invalid version' });
        }
        if (build && !build.match(/\d+/)) {
            return resolve({ error: 'invalid build' });
        }

        // set query and params based on input
        console.log('[getServerURL] getting server urls for', server, version, build);
        let query;
        let params;
        if (build) {
            query = `SELECT download_url FROM ${server} WHERE version = ? AND build = ?`;
            params = [version, build];
        } else if (version) {
            query = `SELECT download_url FROM ${server} WHERE version = ?`;
            params = [version];
        } else {
            query = `SELECT download_url FROM ${server}`;
            params = [];
        }
        con.query(query, params, function (err, result) {
            if (err) {
                console.log('[getServerURL] error getting server urls:', err);
                return reject(err);
            } else {
                console.log('[getServerURL] got server urls:', result[0].download_url);

                // add version and build as latest if they don't exist -- IMPROVE THIS LATER!!!
                if (!version) {
                    version = "latest";
                }
                if (!build) {
                    build = "latest";
                }

                resolve({
                    server: server,
                    version: version,
                    build: build,
                    downloadURL: result[0] ? result[0].download_url : null
                });
            }
        });
    });
}
