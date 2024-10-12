<!-- Todo: change to absolute url path once image has been pushed -->
<img src="web/public/assets/favicon.png" width="100">

# ServerJars
ServerJars automatically fetches and builds the latest versions of many different Minecraft servers, and displays them in one easy place!

## Deployment:
assuming you have docker and docker-compose installed, you can deploy ServerJars by running the following commands:
```bash
wget https://raw.githubusercontent.com/undeadjess/mcserverjars/main/docker-compose.yml
docker-compose up -d
```

## API Usage:
`GET /<type>/<jar>/<version>/<build>`
- type: The type of the server jar. (Server, Proxys coming soon!)
- jar: The server jar file to download. (vanilla, paper, forge)
- version: The minecraft version of the jar. (1.16.5, 1.17.1)
- build: The build number of the server jar. Only for non-vanilla servers (1, 2, 3, ...)

if the build number is not specified, the latest build will be returned.
if neither the version or build number is specified, the latest version will be returned.

#### Examples:
`GET /server/paper/1.17.1/142`
Returns the download link for the 142nd build of the 1.17.1 paper server jar.

`GET /server/paper/1.16.5`
Returns the download link for the latest build of the 1.16.5 paper server jar.

`GET /server/paper`
Returns the download link for the latest build of the latest version of the paper server jar.

## To-Do:
- Add support for proxys (velocity, bungeecord, geyser...)
- Add support for more server jars (only vanilla, paper, and purpur are supported at this time)
- build bukkit and spigot jars and store them in a cache

## FAQ:
 - Why does ServerJars use a database instead of simply fetching the jars from the official websites?
   - ServerJars uses a database to store links to the jars as it will be needed when bukkit and spigot jars are added, as they will have to be built from source. This also allows for the jars to be fetched from a local database instead of the official websites, which would be slower.

