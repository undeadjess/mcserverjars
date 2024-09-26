// web server
const express = require('express');
const app = express();
app.use(express.static('public'));

// get the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// start the server
app.listen(3000, () => {
    console.log('server started');
});


