const serverTypeSelector = document.getElementById("serverType");
const serverVersionSelector = document.getElementById("serverVersion");
const serverBuildSelector = document.getElementById("serverBuild");
const downloadButton = document.getElementById("downloadButton");

let link = "";

// set all selectors to disabled
serverVersionSelector.disabled = true;
serverBuildSelector.disabled = true;
downloadButton.disabled = true;



fetch("https://serverjars.juxtacloud.com/api/servers/")
    .then((response) => response.json())
    .then((data) => {
        console.log(data); // Log the fetched data
        data.forEach(function (serverType) {
            const option = document.createElement("option");
            option.text = serverType;
            serverTypeSelector.add(option);
        });
        serverTypeSelector.selectedIndex = -1;
    })
    .catch((error) => console.error("Error fetching server types:", error));




serverTypeSelector.addEventListener("change", function() {
    const selectedType = serverTypeSelector.value;

    fetch(`https://serverjars.juxtacloud.com/api/servers/${selectedType}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data); // Log the fetched data
            versions = data.versions;
            serverVersionSelector.innerHTML = ""; // Clear previous options
            versions.forEach(function (serverVersion) {
                const option = document.createElement("option");
                option.text = serverVersion;
                serverVersionSelector.add(option);
            });
            serverVersionSelector.add(new Option("latest", "latest")); // Add latest option
            serverVersionSelector.disabled = false;
            serverVersionSelector.selectedIndex = -1;
        })
        .catch((error) => console.error("Error fetching server versions:", error));
});



serverVersionSelector.addEventListener("change", function() {
    const selectedType = serverTypeSelector.value;
    const selectedVersion = serverVersionSelector.value;

    fetch(`https://serverjars.juxtacloud.com/api/servers/${selectedType}/${selectedVersion}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data); // Log the fetched data
            builds = data.builds;
            serverBuildSelector.innerHTML = ""; // Clear previous options
            builds.forEach(function (serverBuild) {
                const option = document.createElement("option");
                option.text = serverBuild;
                serverBuildSelector.add(option);
            });
            serverBuildSelector.add(new Option("latest", "latest")); // Add latest option
            serverBuildSelector.disabled = false;
            serverBuildSelector.selectedIndex = -1;
        })
        .catch((error) => console.error("Error fetching server builds:", error));
});



serverBuildSelector.addEventListener("change", function() {
    const selectedType = serverTypeSelector.value + "/";
    const selectedVersion = serverVersionSelector.value === "latest" ? "" : serverVersionSelector.value + "/";
    const selectedBuild = serverBuildSelector.value === "latest" ? "" : serverBuildSelector.value + "/";

    url = `https://serverjars.juxtacloud.com/api/servers/${selectedType}${selectedVersion}${selectedBuild}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            link = data.latest.downloadURL;
            console.log(link); // Log the fetched data
            downloadButton.disabled = false;
        })
        .catch((error) => console.error("Error fetching server builds:", error));

});

downloadButton.addEventListener("click", function() {
    if (url === "") {
        alert("Please select a server type, version, and build.");
    } else {
        // open new tab
        window.open(link, "_blank");
    }
});