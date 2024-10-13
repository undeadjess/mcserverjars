serverTypeSelector = document.getElementById("serverType");
serverVersionSelector = document.getElementById("serverVersion");
serverBuildSelector = document.getElementById("serverBuild");

fetch("https://serverjars.juxtacloud.com/api/servers/")
    .then((response) => response.json())
    .then((data) => {
        serverTypes = data;
    })
    .then(
        serverTypes.forEach(function (serverType) {
            var option = document.createElement("option");
            option.text = serverType;
            serverTypeSelector.add(option);
        }),
    );

serverTypeSelector.addEventListener("change", function() {
    fetch("https://serverjars.juxtacloud.com/api/servers/" + serverTypeSelector.value)
        .then((response) => response.json())
        .then((data) => {
        serverVersions = data;
        })
        .then(
            serverVersions.forEach(function (serverVersion) {
                var option = document.createElement("option");
                option.text = serverVersion;
                serverVersionSelector.add(option);
            }),
        )
        .then(
            serverBuildSelector.add(new Option("latest", "latest")),
        )
});

serverVersionSelector.addEventListener("change", function() {
    fetch("https://serverjars.juxtacloud.com/api/servers/" + serverTypeSelector.value + "/" + serverVersionSelector.value)
        .then((response) => response.json())
        .then((data) => {
        serverBuilds = data;
        })
        .then(
            serverBuilds.forEach(function (serverBuild) {
                var option = document.createElement("option");
                option.text = serverBuild;
                serverBuildSelector.add(option);
            }),
        )
        .then(
            serverBuildSelector.add(new Option("latest", "latest")),
        )
});

serverBuildSelector.addEventListener("change", function() {
    selectedType = serverTypeSelector.value + "/"
    if (serverVersionSelector.value == "latest") {
        selectedVersion = null
    } else {
        selectedVersion = serverVersionSelector.value + "/"
    }

    if (serverBuildSelector.value == "latest") {
        selectedBuild = null
    } else {
        selectedBuild = serverBuildSelector.value + "/"
    }

    fetch("https://serverjars.juxtacloud.com/api/servers/" + selectedType + selectedVersion + selectedBuild)
});