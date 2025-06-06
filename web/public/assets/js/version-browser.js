BaseUrl = "https://serverjars.juxtacloud.com/api";

typeDropdown = document.getElementById("type-select");
serverDropdown = document.getElementById("server-select");
versionDropdown = document.getElementById("version-select");
defaultServerDropdownContent = serverDropdown.innerHTML;
defaultVersionDropdownContent = versionDropdown.innerHTML;

infoMessage = document.getElementById("version-info");
versionList = document.getElementById("version-list");

const fetchTypes = async () => {
    const response = await fetch(BaseUrl);
    const types = await response.json();
    return types;
};

const fetchServers = async (type) => {
    const response = await fetch(`${BaseUrl}/${type}`);
    const versions = await response.json();
    return versions;
};

const fetchVersions = async (type, server) => {
    const response = await fetch(`${BaseUrl}/${type}/${server}`);
    const versions = await response.json();
    return versions;
};

const populateTypes = async () => {
    fetchTypes().then((types) => {
        types.types.forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeDropdown.appendChild(option);
        });

        typeDropdown.disabled = false;
        typeDropdown.selectedIndex = 0;

        typeDropdown.addEventListener("change", (event) => {
            const selectedType = event.target.value;
            versionList.innerHTML = "";
            infoMessage.style.display = "";
            populateServers(selectedType);
        });

        // check if the type is specified in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const typeFromUrl = urlParams.get("type");
        if (typeFromUrl && types.types.includes(typeFromUrl)) {
            typeDropdown.value = typeFromUrl;
            typeDropdown.dispatchEvent(new Event("change"));
        }
    });
};

const populateServers = async (type) => {
    serverDropdown.innerHTML = defaultServerDropdownContent;
    versionDropdown.innerHTML = defaultVersionDropdownContent;
    versionDropdown.disabled = true;

    fetchServers(type).then((servers) => {
        servers[type].forEach((server) => {
            const option = document.createElement("option");
            option.value = server;
            option.textContent = server;
            serverDropdown.appendChild(option);
        });

        serverDropdown.disabled = false;
        serverDropdown.selectedIndex = 0;

        serverDropdown.addEventListener("change", (event) => {
            const selectedServer = event.target.value;
            populateVersions(type, selectedServer);
            displayVersions(type, selectedServer);
        });

        // check if the server is specified in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const serverFromUrl = urlParams.get("server");
        if (serverFromUrl && servers[type].includes(serverFromUrl)) {
            serverDropdown.value = serverFromUrl;
            serverDropdown.dispatchEvent(new Event("change"));
        }
    });
};

const populateVersions = async (type, server) => {
    versionDropdown.innerHTML = defaultVersionDropdownContent;

    fetchVersions(type, server).then((versions) => {
        versions.versions.forEach((version) => {
            const option = document.createElement("option");
            option.value = version;
            option.textContent = version;
            versionDropdown.appendChild(option);
        });

        versionDropdown.disabled = false;
        versionDropdown.selectedIndex = 0;

        versionDropdown.addEventListener("change", (event) => {
            const selectedVersion = event.target.value;
            displayBuilds(type, server, selectedVersion);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const versionFromUrl = urlParams.get("version");
        if (versionFromUrl && versions.versions.includes(versionFromUrl)) {
            versionDropdown.value = versionFromUrl;
            versionDropdown.dispatchEvent(new Event("change"));
        }
    });
};

const displayVersions = async (type, server) => {
    versionList.innerHTML = "";
    infoMessage.style.display = "none";

    fetchVersions(type, server).then((versions) => {
        if (versions.versions.length === 0) {
            infoMessage.textContent = "No versions available for this server.";
            infoMessage.style.display = "block";
            return;
        }

        versions.versions.forEach((version) => {
            const listItem = document.createElement("li");
            listItem.className = "version-item";

            const versionName = document.createElement("span");
            versionName.className = "version-name";
            versionName.textContent = server;

            const versionNumber = document.createElement("span");
            versionNumber.className = "version-number";
            versionNumber.textContent = version;

            const downloadLink = document.createElement("button");
            downloadLink.className = "download-link";
            downloadLink.textContent = "Download";
            downloadLink.onclick = () => {
                downloadJar(type, server, version);
            };

            listItem.appendChild(versionName);
            listItem.appendChild(versionNumber);
            listItem.appendChild(downloadLink);
            versionList.appendChild(listItem);
        });
    });
};

const displayBuilds = async (type, server) => {
    const selectedVersion = versionDropdown.value;
    if (!selectedVersion) {
        infoMessage.textContent = "Please select a version.";
        infoMessage.style.display = "block";
        return;
    }

    fetch(`${BaseUrl}/${type}/${server}/${selectedVersion}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.builds && data.builds.length > 0) {
                versionList.innerHTML = "";
                data.builds.forEach((build) => {
                    const listItem = document.createElement("li");
                    listItem.className = "version-item";

                    const versionName = document.createElement("span");
                    versionName.className = "version-name";
                    versionName.textContent = server;

                    const versionNumber = document.createElement("span");
                    versionNumber.className = "version-number";
                    versionNumber.textContent = selectedVersion;

                    const buildName = document.createElement("span");
                    buildName.className = "version-name";
                    buildName.textContent = `Build ${build}`;

                    const downloadLink = document.createElement("button");
                    downloadLink.className = "download-link";
                    downloadLink.textContent = "Download";
                    downloadLink.onclick = () => {
                        downloadJar(type, server, selectedVersion, build);
                    };

                    listItem.appendChild(versionName);
                    listItem.appendChild(versionNumber);
                    listItem.appendChild(buildName);
                    listItem.appendChild(downloadLink);
                    versionList.appendChild(listItem);
                });
            } else {
                infoMessage.textContent = "No builds available for this version.";
                infoMessage.style.display = "block";
            }
        })
        .catch((error) => {
            console.error("Error fetching builds:", error);
            infoMessage.textContent = "Failed to fetch builds. Please try again later.";
            infoMessage.style.display = "block";
        });
};

const downloadJar = (type, server, version, build) => {
    nobuild = false;
    if (!build) {
        nobuild = true;
        build = "";
    }

    fetch(`${BaseUrl}/${type}/${server}/${version}/${build}`)
        .then((response) => response.json())
        .then((data) => {
            if (nobuild) {
                downloadURL = data.latest.downloadURL;
                if (downloadURL) {
                    window.location = downloadURL;
                } else {
                    alert("No latest build available for this version.");
                }
            } else {
                downloadURL = data.downloadURL;
                if (downloadURL) {
                    window.location = downloadURL;
                } else {
                    alert("Download URL not found for the selected version.");
                }
            }
        })
        .catch((error) => {
            console.error("Error fetching download URL:", error);
            alert("Failed to fetch download URL. Please try again later.");
        });
};

populateTypes();
