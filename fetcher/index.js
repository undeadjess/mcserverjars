
// getMinecraftVersions
function getMinecraftVersions() {
    return new Promise((resolve, reject) => {
        var mcversions = [];
        console.log('getVersions running:');
        url = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                versions = data.versions;
                versions.forEach(version => {
                    if (version.type === 'release') {
                        console.log('got version ', version.id);
                        mcversions.push(version.id.toString());
                    }
                });
                resolve(mcversions); // Resolve the promise with the results
            })
            .catch(error => {
                console.log('error:', error);
                resolve(mcversions); // Resolve the promise even if there's an error
            });
    });
}

// Call getVersions and handle the promise
getMinecraftVersions().then(versions => {
    console.log("versions:", versions);
});


mcversions = getMinecraftVersions();

// getting scripts

// vanilla

function getVanillaServerURL(version) {

}




