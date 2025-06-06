const serverBaseUrl = "https://serverjars.juxtacloud.com/api";

const typeList = document.getElementById("type-list");
const typeContent = document.getElementById("type-content");

const fetchTypes = async () => {
    const response = await fetch(serverBaseUrl);
    const types = await response.json();
    return types;
}

const populateTypeList = async () => {
    const typesResponse = await fetchTypes();
    const types = typesResponse.types;
    console.log(types);
    types.forEach((type) => {
        const li = document.createElement("li");
        li.innerHTML = `<button class="type-tab" onclick="openTab('${type}'); document.querySelectorAll('.type-tab').forEach(tab => tab.classList.remove('active')); this.classList.add('active');">${type}</button>`;
        typeList.appendChild(li);
    });
    typeList.removeChild(document.getElementById("loading-type"));
    openTab(types[0]);
    const firstTab = document.querySelector(".type-tab");
    firstTab.classList.add("active");

};

populateTypeList();

const openTab = async (type) => {
    // clear the content
    typeContent.innerHTML = "";

    // fetch the servers for the selected type
    const response = await fetch(serverBaseUrl + "/" + type);
    const serversResponse = await response.json();
    const servers = serversResponse[type] || [];
    console.log(servers);

    // make menu for each server
    servers.forEach((server) => {
        const div = document.createElement("div");
        div.className = "server";
        div.innerHTML = `<h3>${server}</h3>`;
        // fetch the server versions
        versions = fetchVersions(type, server);
        console.log(versions);
        versions.then((versions) => {
            const versionList = document.createElement("div");
            versionList.className = "version-list";

            latest = versionList.appendChild(document.createElement("p"));
            latest.innerHTML = versions.versions[0];
            downloadButton = versionList.appendChild(document.createElement("button"));
            downloadButton.className = "download-latest-button";
            downloadButton.innerHTML = "Download Latest";
            downloadButton.onclick = () => {window.location = versions.latest.downloadURL;};

            separator = versionList.appendChild(document.createElement("hr"));

            previousVersions = versionList.appendChild(document.createElement("p"));
            previousVersions.innerHTML = "Previous Versions: " + versions.versions[0] + ", " + versions.versions[1] + ", " + versions.versions[2] + "... ";
            previousVersions.className = "previous-versions";
            previousVersionsButton = versionList.appendChild(document.createElement("button"));
            previousVersionsButton.className = "previous-versions-button";
            previousVersionsButton.innerHTML = "Show Previous Versions";
            previousVersionsButton.onclick = () => {
                window.location = "version-browser" + "?type=" + type + "&server=" + server;
            }

            versionList.appendChild(latest);
            versionList.appendChild(downloadButton);
            versionList.appendChild(separator);
            versionList.appendChild(previousVersions);
            versionList.appendChild(previousVersionsButton);
            div.appendChild(versionList);
        });
        typeContent.appendChild(div);
    });
    // make button appear selected 
    

}

const fetchVersions = async (type, server) => {
    const response = await fetch(serverBaseUrl + "/" + type + "/" + server);
    const versions = await response.json();
    return versions;
}