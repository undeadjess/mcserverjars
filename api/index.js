databasePath = '../fetcher/servers.db';
validTypes = ['servers'];
port = 8080;

const { json } = require('body-parser');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database(databasePath);
let validServers = [];



function getValidServers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT name FROM sqlite_master WHERE type = "table"', (err, rows) => {
            if (err) {
                console.log('error getting servers:', err);
                reject(err);
            } else {
                resolve(rows.filter(row => row.name !== 'server_types').map(row => row.name));
            }
        });
    });
}

async function initialize() {
    console.log('initializing server');
    try {
        validServers = await getValidServers();
        console.log('fetched latest valid servers:', validServers);
        app.listen(port, () => {
            console.log(`server listening on port ${port}`);
        });
        console.log('server initialized');
    } catch (error) {
        console.error('Error initializing server:', error);
    }
}

initialize();



// routes
app.get('/', (req, res) => {
    console.log('\nNew request to', req.path, " from IP address:", req.ip);
    res.send('MCServerJars api');
});

app.get('/api/servers', (req, res) => {
    console.log('\nNew request to', req.path, " from IP address:", req.ip);
    res.json(validServers);
});

app.get('/api/servers/:server/:version/:build', (req, res) => {
    console.log('\nNew request to', req.path, " from IP address:", req.ip);
    const { server, version, build } = req.params;
    getServerURL(server, version, build).then((data) => {
        res.json(data);
    });
});

app.get('/api/servers/:server/:version', (req, res) => {
    console.log('\nNew request to', req.path, " from IP address:", req.ip);
    const { server, version } = req.params;
    getServerURL(server, version, null).then((data) => {
        res.json(data);
    });
});

app.get('/api/servers/:server', (req, res) => {
    console.log('\nNew request to', req.path, " from IP address:", req.ip);
    const { server } = req.params;
    getServerURL(server, null, null).then((data) => {
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
        console.log('getting server urls for', server, version, build);
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

        // fetch data from database, and resolve promise with the result
        db.get(query, params, (err, row) => {
            if (err) {
                console.log('error getting server urls:', err);
                return reject(err);
            } else {
                console.log('got server urls:', row.download_url);

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
                    downloadURL: row ? row.download_url : null
                });
            }
        });
    });
}
