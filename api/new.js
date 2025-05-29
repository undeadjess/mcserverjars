// -----------------

// types:
// servers
// proxies

// servers that dont need building:
// vanilla
// fabric
// paper
// purpur

// server types that need building:
// forge
// spigot

// proxies
// velocity
// geyser

// -----------------

const LISTEN_PORT = 3000;

const types = [
    "servers",
    "proxies"
]

// express web server
const express = require("express");
const app = express();

// file system
const path = require("path");
const fs = require("fs");

app.get("/api", (req, res) => {
    console.log(
        "[routes] New request to",
        req.path,
        " from IP address:",
        req.ip
    );
    res.json({
        types: types
    });
});

app.get("/api/:type/:server?/:version?/:build?", (req, res) => {
    console.log(
        "[routes] New request to",
        req.path,
        " from IP address:",
        req.ip
    );
    
    const { type, server, version, build } = req.params;

    // if (!types.includes(type)) {
    //     return res.status(400).json({
    //         error: "Invalid type. Valid types are: " + types.join(", ")
    //     });
    // }

    switch (type) {
        case "servers":
            if (!server) {
                return fetchServers()
                    .then(servers => res.json({ servers }))
                    .catch(err => res.status(500).json({ error: err.message }));
            } else if (server && !version) {
                return fetchServerVersions(server)
                    .then(versions => res.json({ versions }))
                    .catch(err => res.status(500).json({ error: err.message }));
            } else if (server && version && !build) {
                return fetchServerBuilds(server, version)
                    .then(builds => {res.json({ builds })})

                    .catch(err => res.status(500).json({ error: err.message }));
            } else if (server && version && build) {
                downloadURL = fetchServerDownloadURL(server, version, build)
                    .then(url => {
                        if (url) {
                            return res.json({ downloadURL: url });
                        } else {
                            return res.status(404).json({ error: "Build not found" });
                        }
                    })
                    .catch(err => res.status(500).json({ error: err.message }));
                return downloadURL;
            }

            break;

        case "proxies":
            if (!server) {
                return fetchProxies()
                    .then(proxies => res.json({ proxies }))
                    .catch(err => res.status(500).json({ error: err.message }));
            } else if (server && !version) {
                return fetchProxyVersions(server)
                    .then(versions => res.json({ versions }))
                    .catch(err => res.status(500).json({ error: err.message }));
            } else if (server && version && !build) {
                return fetchProxyBuilds(server, version)
                    .then(builds => res.json({ builds }))
                    .catch(err => res.status(500).json({ error: err.message }));
            } else if (server && version && build) {
                return fetchProxyDownloadURL(server, version, build)
                    .then(url => {
                        if (url) {
                            return res.json({ downloadURL: url });
                        } else {
                            return res.status(404).json({ error: "Build not found" });
                        }
                    })
                    .catch(err => res.status(500).json({ error: err.message }));
            }
            break;
        
        default:
            return res.status(400).json({
                error: "Invalid type. Valid types are: " + types.join(", ")
            });
    }

    return res.status(404).json({
        error: "Not found"
    });
});


const serversDir = path.join(__dirname, "servers");
const proxiesDir = path.join(__dirname, "proxies");
const serverModules = {};
const proxyModules = {};

// Dynamically import all server files
fs.readdirSync(serversDir).forEach(file => {
    const serverName = path.basename(file, ".js");
    const serverModule = require(path.join(serversDir, file));
    serverModules[serverName] = serverModule;
});

// Dynamically load proxies
fs.readdirSync(proxiesDir).forEach(file => {
    const proxyName = path.basename(file, ".js");
    const proxyModule = require(path.join(proxiesDir, file));
    proxyModules[proxyName] = proxyModule;
});

// server functions
const fetchServers = () => Promise.resolve(Object.keys(serverModules));

const fetchServerVersions = (server) => {
    if (!serverModules[server]) {
        return Promise.reject(new Error("Server not found"));
    }
    return serverModules[server].getVersions();
};

const fetchServerBuilds = (server, version) => {
    if (!serverModules[server]) {
        return Promise.reject(new Error("Server not found"));
    }
    return serverModules[server].getBuilds(version);
};

const fetchServerDownloadURL = (server, version, build) => {
    if (!serverModules[server]) {
        return Promise.reject(new Error("Server not found"));
    }
    return serverModules[server].getDownloadURL(version, build);
};

const fetchProxies = () => Promise.resolve(Object.keys(proxyModules));

const fetchProxyVersions = (proxy) => {
    if (!proxyModules[proxy]) {
        return Promise.reject(new Error("Proxy not found"));
    }
    return proxyModules[proxy].getVersions();
};

const fetchProxyBuilds = (proxy, version) => {
    if (!proxyModules[proxy]) {
        return Promise.reject(new Error("Proxy not found"));
    }
    return proxyModules[proxy].getBuilds(version);
};

const fetchProxyDownloadURL = (proxy, version, build) => {
    if (!proxyModules[proxy]) {
        return Promise.reject(new Error("Proxy not found"));
    }
    return proxyModules[proxy].getDownloadURL(version, build);
};

app.listen(LISTEN_PORT, () => {
    console.log(
        "[routes] Server is running on port",
        LISTEN_PORT
    );
});
