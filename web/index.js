// web server
const express = require('express');
const app = express();
app.use(express.static('public'));



const port = process.env.LISTEN_PORT || 3000;


// serve the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// serve public/ directory
app.use(express.static('public'));

// serve html files in public/ directory
app.use(express.static('public', {
    extensions: ['html']
}));

// start the server
app.listen(port, () => {
    console.log('server started on port ,', port);
});


