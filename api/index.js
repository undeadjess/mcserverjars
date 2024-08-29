// api!!
// still dont konw what im doing


// api docs (yes im putting them in the code)
// /api                                     // returns some usage info
// /api/servers                             // returns all servers
// /api/servers/<server>                    // returns all versions of the specified server
// /api/servers/<server>/<version>          // returns the download url of the server version - if server has multiple builds, returns latest build
// /api/servers/<server>/<version>/<build>  // returns the download url of the server version build


const { json } = require('body-parser');
const express = require('express');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    console.log('new request to /');
    res.send('serverjars api');
});

// actual api stuff
// with build specified
app.get('/api/servers/:server/:version/:build', (req, res) => {
    console.log('\nNew request to', req.path);
    const { server, version, build } = req.params;
    res.json(getServerURLs(server, version, build));

});

app.get('/api/servers/:server/:version', (req, res) => {
    console.log('\nNew request to', req.path);
    const { server, version } = req.params;
    res.json(getServerURLs(server, version, null));
});


function getServerURLs(server, version, build) {
    return {
        server: server,
        version: version,
        build: build,
    };
}




app.listen(port, () => {
    console.log(`listening on port ${port}`);
});