// api!!
// still dont konw what im doing

databasePath = '../fetcher/servers.db';
validServers = ['vanilla', 'paper', 'purpur', 'spigot', 'bukkit', 'forge'];
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


// root
app.get('/', (req, res) => {
    console.log('new request to /');
    res.send('serverjars api');
});

// actual api stuff
app.get('/api/servers/:server/:version/:build', (req, res) => {
    console.log('\nNew request to', req.path);
    const { server, version, build } = req.params;
    res.json(getServerURLs(server, version, build));

});

app.get('/api/servers/:server/:version', (req, res) => {
    console.log('\nNew request to', req.path);
    const { server, version } = req.params;
    res.json(getServerURL(server, version, null));
});


// get server URLs
function getServerURL(server, version, build) {
    // make sure valuse are valid to prevent sql injection
    // server
    if (!validServers.includes(server)) {
        return { error: 'invalid server' };
    }
    // version
    if (!version.match(/\d+\.\d+(\.\d+)?/)) {
        return { error: 'invalid version' };
    }
    // build
    if (build && !build.match(/\d+/)) {
        return { error: 'invalid build' };
    }


    console.log('getting server urls for', server, version, build);
    let query;
    let params;
    let download_url;
    if (build) {
        query = `SELECT download_url FROM ${server} WHERE version = ? AND build = ?`;
        params = [version, build];
    } else {
        query = `SELECT download_url FROM ${server} WHERE version = ?`;
        params = [version];
    }
    db.get(query, params, (err, row) => {
        if (err) {
            console.log('error getting server urls:', err);
            reject(err);
        } else {
            console.log('got server urls:', row);
            download_url = row;                                // PROBLEMMMM HERE (row is undefined cause its not defined yet because its async)
        }
    });




    console.log(download_url);
    return {
        server: server,
        version: version,
        build: build,
        downloadURL: download_url
    };
}




app.listen(port, () => {
    console.log(`listening on port ${port}`);
});