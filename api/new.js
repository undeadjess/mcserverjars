const LISTEN_PORT = 3000;

const types = ["servers", "proxies"];

const express = require("express");
const app = express();

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
        types: types,
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

    switch (type) {
        case "servers":
            if (!server) {
                return fetchServers()
                    .then((servers) => res.json({ servers }))
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            } else if (server && !version) {
                return fetchServerVersions(server)
                    .then((data) => res.json(data))
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            } else if (server && version && !build) {
                return fetchServerBuilds(server, version)
                    .then((data) => res.json(data))
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            } else if (server && version && build) {
                return fetchServerDownloadURL(server, version, build)
                    .then((url) => {
                        if (url) {
                            return res.json({ downloadURL: url });
                        } else {
                            return res
                                .status(404)
                                .json({ error: "Build not found" });
                        }
                    })
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            }
            break;

        case "proxies":
            if (!server) {
                return fetchProxies()
                    .then((proxies) => res.json({ proxies }))
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            } else if (server && !version) {
                return fetchProxyVersions(server)
                    .then((data) => res.json(data))
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            } else if (server && version && !build) {
                return fetchProxyBuilds(server, version)
                    .then((data) => res.json(data))
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            } else if (server && version && build) {
                return fetchProxyDownloadURL(server, version, build)
                    .then((url) => {
                        if (url) {
                            return res.json({ downloadURL: url });
                        } else {
                            return res
                                .status(404)
                                .json({ error: "Build not found" });
                        }
                    })
                    .catch((err) =>
                        res.status(500).json({ error: err.message })
                    );
            }
            break;

        default:
            return res.status(400).json({
                error: "Invalid type. Valid types are: " + types.join(", "),
            });
    }

    return res.status(404).json({ error: "Not found" });
});

const serversDir = path.join(__dirname, "servers");
const proxiesDir = path.join(__dirname, "proxies");
const serverModules = {};
const proxyModules = {};

// Dynamically import all server files
fs.readdirSync(serversDir).forEach((file) => {
    const serverName = path.basename(file, ".js");
    const serverModule = require(path.join(serversDir, file));
    serverModules[serverName] = serverModule;
});

// Dynamically load proxies
fs.readdirSync(proxiesDir).forEach((file) => {
    const proxyName = path.basename(file, ".js");
    const proxyModule = require(path.join(proxiesDir, file));
    proxyModules[proxyName] = proxyModule;
});

// server functions
const fetchServers = () => Promise.resolve(Object.keys(serverModules));

const fetchServerVersions = async (server) => {
    if (!serverModules[server]) {
        throw new Error("Server not found");
    }

    const versions = await serverModules[server].getVersions();
    let latest = null;

    if (serverModules[server].getLatest) {
        try {
            latest = await serverModules[server].getLatest();
        } catch (err) {
            console.log(
                `[fetchServerVersions] Could not get latest for ${server}:`,
                err.message
            );
        }
    }

    return { latest, versions };
};

const fetchServerBuilds = async (server, version) => {
    if (!serverModules[server]) {
        throw new Error("Server not found");
    }

    const builds = await serverModules[server].getBuilds(version);
    let latest = null;

    if (builds.length > 0) {
        const latestBuild = builds[0];
        try {
            const downloadURL = await serverModules[server].getDownloadURL(
                version,
                latestBuild
            );
            latest = {
                server,
                version,
                build: latestBuild,
                downloadURL,
            };
        } catch (err) {
            console.log(
                `[fetchServerBuilds] Could not get latest build info:`,
                err.message
            );
        }
    }

    return { latest, builds };
};

const fetchServerDownloadURL = (server, version, build) => {
    if (!serverModules[server]) {
        return Promise.reject(new Error("Server not found"));
    }
    return serverModules[server].getDownloadURL(version, build);
};

const fetchProxies = () => Promise.resolve(Object.keys(proxyModules));

const fetchProxyVersions = async (proxy) => {
    if (!proxyModules[proxy]) {
        throw new Error("Proxy not found");
    }

    const versions = await proxyModules[proxy].getVersions();
    let latest = null;

    if (proxyModules[proxy].getLatest) {
        try {
            latest = await proxyModules[proxy].getLatest();
        } catch (err) {
            console.log(
                `[fetchProxyVersions] Could not get latest for ${proxy}:`,
                err.message
            );
        }
    }

    return { latest, versions };
};

const fetchProxyBuilds = async (proxy, version) => {
    if (!proxyModules[proxy]) {
        throw new Error("Proxy not found");
    }

    const builds = await proxyModules[proxy].getBuilds(version);
    let latest = null;

    if (builds.length > 0) {
        const latestBuild = builds[0];
        try {
            const downloadURL = await proxyModules[proxy].getDownloadURL(
                version,
                latestBuild
            );
            latest = {
                server: proxy,
                version,
                build: latestBuild,
                downloadURL,
            };
        } catch (err) {
            console.log(
                `[fetchProxyBuilds] Could not get latest build info:`,
                err.message
            );
        }
    }

    return { latest, builds };
};

const fetchProxyDownloadURL = (proxy, version, build) => {
    if (!proxyModules[proxy]) {
        return Promise.reject(new Error("Proxy not found"));
    }
    return proxyModules[proxy].getDownloadURL(version, build);
};

app.listen(LISTEN_PORT, () => {
    console.log("[routes] Server is running on port", LISTEN_PORT);
});
