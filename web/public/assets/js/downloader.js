// set selector variables to the corresponding HTML elements
const serverTypeSelector = document.getElementById("serverType");
const serverVersionSelector = document.getElementById("serverVersion");
const serverBuildSelector = document.getElementById("serverBuild");
const downloadButton = document.getElementById("downloadButton");

let finalDirectDownloadURL = "";

// set all selectors to disabled
serverVersionSelector.disabled = true;
serverBuildSelector.disabled = true;
downloadButton.disabled = true;


// get server types from api to populate the server type selector
fetch("https://serverjars.juxtacloud.com/api/servers/")
    .then((response) => response.json())
    .then((data) => {
        data.forEach(function (serverType) {
            const option = document.createElement("option");
            option.text = serverType;
            serverTypeSelector.add(option);
        });
        serverTypeSelector.selectedIndex = -1;
    })
    .catch((error) => console.error("Error fetching server types:", error));



// when the server type selector changes, get the server versions from the api
serverTypeSelector.addEventListener("change", function() {
    const selectedType = serverTypeSelector.value;

    fetch(`https://serverjars.juxtacloud.com/api/servers/${selectedType}`)
        .then((response) => response.json())
        .then((data) => {
            versions = data.versions;
            serverVersionSelector.innerHTML = ""; // Clear previous options

            // add latest option first
            serverVersionSelector.add(new Option("latest", ""));

            versions.forEach(function (serverVersion) {
                const option = document.createElement("option");
                option.text = serverVersion;
                serverVersionSelector.add(option);
            });

            // set version selector to the latest version
            serverVersionSelector.selectedIndex = 0;
            serverVersionSelector.dispatchEvent(new Event("change"));

            // enable version selector and disable others
            serverVersionSelector.disabled = false;
            serverBuildSelector.innerHTML = "";
            downloadButton.disabled = true;
        })
        .catch((error) => console.error("Error fetching server versions:", error));
});


// when the server version selector changes, get the server builds from the api
serverVersionSelector.addEventListener("change", function() {
    const selectedType = serverTypeSelector.value;
    const selectedVersion = serverVersionSelector.value;

    // if the selected version is "latest", get the latest build from the api and set the download url, else get the builds from  api
    if (selectedVersion === "latest") {
        serverBuildSelector.innerHTML = "latest";
        serverBuildSelector.disabled = true;
        
        url = `https://serverjars.juxtacloud.com/api/servers/${selectedType}`;
        console.log("api url:", url);
    
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                console.log("got from api: ", data);
                finalDirectDownloadURL = data.latest.downloadURL;
                console.log("set downlaod finalDirectDownloadURL to:", finalDirectDownloadURL);
                downloadButton.disabled = false;
            })
            .catch((error) => console.error("Error fetching server builds:", error));

    } else {
        fetch(`https://serverjars.juxtacloud.com/api/servers/${selectedType}/${selectedVersion}`)
            .then((response) => response.json())
            .then((data) => {
                builds = data.builds;
                serverBuildSelector.innerHTML = "";
                
                // add latest option
                serverBuildSelector.add(new Option("latest", "latest"));

                builds.forEach(function (serverBuild) {
                    const option = document.createElement("option");
                    option.text = serverBuild;
                    serverBuildSelector.add(option);
                });

                
                // set version selector to latest version
                serverBuildSelector.selectedIndex = 0;
                serverBuildSelector.dispatchEvent(new Event("change"));

                // enable build selector
                serverBuildSelector.disabled = false;
                downloadButton.disabled = true;
            })
            .catch((error) => console.error("Error fetching server builds:", error));
    }
});


// when the server build selector changes, get the download url from the api
serverBuildSelector.addEventListener("change", function() {
    const selectedType = serverTypeSelector.value + "/";
    const selectedVersion = serverVersionSelector.value === "latest" ? "" : serverVersionSelector.value + "/";
    const selectedBuild = serverBuildSelector.value === "latest" ? "" : serverBuildSelector.value + "/";

    url = `https://serverjars.juxtacloud.com/api/servers/${selectedType}${selectedVersion}${selectedBuild}`;
    console.log("api url:", url);
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            finalDirectDownloadURL = data.latest.downloadURL;

            // enable the download button
            downloadButton.disabled = false;
        })
        .catch((error) => console.error("Error fetching server builds:", error));

});

downloadButton.addEventListener("click", function() {
    if (url === "") {
        // should never happen but just in case :P
        alert("Please select a server type, version, and build.");
    } else {
        // open download link in new tab
        window.open(finalDirectDownloadURL, "_blank");
        console.log("Downloading from:", finalDirectDownloadURL);
    }
});