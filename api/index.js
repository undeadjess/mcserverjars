// api!!
// still dont konw what im doing


// api docs (yes im putting them in the code)
// /api                                     // returns some usage info
// /api/servers                             // returns all servers
// /api/servers/<server>                    // returns all versions of the specified server
// /api/servers/<server>/<version>          // returns the download url of the server version - if server has multiple builds, returns latest build
// /api/servers/<server>/<version>/<build>  // returns the download url of the server version build


const express = require('express');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send('serverjars api');
});

// when /api path is accessed
app.get('/api', (req, res) => {

});



app.listen(port, () => {
    console.log(`listening on port ${port}`);
});