// api!!
// still dont konw what im doing

databasePath = '../fetcher/servers.db';
validTypes = ['servers'];
port = 8080;



// api docs (yes im putting them in the code)
// /api                                     // returns some usage info
// /api/servers                             // returns all servers
// /api/servers/<server>                    // returns all versions of the specified server
// /api/servers/<server>/<version>          // returns the download url of the server version - if server has multiple builds, returns latest build
// /api/servers/<server>/<version>/<build>  // returns the download url of the server version build


const { json } = require('body-parser');
const express = require('express');
const app = express();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(databasePath);

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

let validServers = [];

async function initialize() {
    try {
        validServers = await getValidServers();
        console.log('valid servers:', validServers);
        app.listen(port, () => {
            console.log(`listening on port ${port}`);
        });
    } catch (error) {
        console.error('Error initializing server:', error);
    }
}

initialize();

// root
app.get('/', (req, res) => {
    console.log('new request to /');
    res.send('serverjars api');
});

// actual api stuff
app.get('/api/servers/:server/:version/:build', (req, res) => {
    console.log('\nNew request to', req.path);
    const { server, version, build } = req.params;
    getServerURL(server, version, build).then((data) => {
        res.json(data);
    });
});

app.get('/api/servers/:server/:version', (req, res) => {
    console.log('\nNew request to', req.path);
    const { server, version } = req.params;
    getServerURL(server, version, null).then((data) => {
        res.json(data);
    });
});

app.get('/api/servers/:server', (req, res) => {
    console.log('\nNew request to', req.path);
    const { server } = req.params;
    getServerURL(server, null, null).then((data) => {
        res.json(data);
    }); 0+0; // <--- ALIAH WAS HERE
});

// get server URLs
function getServerURL(server, version, build) {
    return new Promise((resolve, reject) => {
        // Make sure values are valid to prevent SQL injection
        // server
        if (!(validServers.includes(server))) {
            return resolve({ error: 'invalid server' });
        }
        // version
        if (version && !version.match(/\d+\.\d+(\.\d+)?/)) {
            return resolve({ error: 'invalid version' });
        }
        // build
        if (build && !build.match(/\d+/)) {
            return resolve({ error: 'invalid build' });
        }

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

        db.get(query, params, (err, row) => {
            if (err) {
                console.log('error getting server urls:', err);
                return reject(err);
            } else {
                console.log('got server urls:', row);
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
