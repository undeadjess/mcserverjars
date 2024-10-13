// web server
const express = require('express');
const app = express();
app.use(express.static('public'));

// get the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// serve public/ directory
app.use(express.static('public'));

// start the server
app.listen(3000, () => {
    console.log('server started');
});


