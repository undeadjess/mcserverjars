<!-- Todo: change to absolute url path once image has been pushed -->
<img src="https://raw.githubusercontent.com/undeadjess/mcserverjars/refs/heads/main/web/public/assets/images/favicon.png" width="100">

# ServerJars

ServerJars automatically fetches and builds the latest versions of many different Minecraft servers, and displays them in one easy place!

## Deployment:

> ServerJars is not yet ready for production use

Assuming you have docker and docker-compose installed, you can deploy ServerJars by running the following commands:

```bash
wget https://raw.githubusercontent.com/undeadjess/mcserverjars/main/docker-compose.yml
docker-compose up -d
```

ServerJars will then be available on port 80

## API Usage:

`GET /api/<type>/<jar>/<version>/<build>`

-   type: The type of the server jar. (Servers, Proxies and more coming soon!)
-   jar: The server jar file to download. (vanilla, paper, forge)
-   version: The minecraft version of the jar. (1.16.5, 1.17.1)
-   build: The build number of the server jar. Only for non-vanilla servers (1, 2, 3, ...)

Both `version` and `build` are optional. if none are specified, the latest version will be returned

#### Examples:

`GET /api/server/paper/1.17.1/142`
Returns the download link for the 142nd build of the 1.17.1 paper server jar.

`GET /api/server/paper/1.16.5`
Returns the download link for the latest build of the 1.16.5 paper server jar.

`GET /api/server/paper`
Returns the download link for the latest build of the latest version of the paper server jar.

## Future Plans:

-   Add support for proxys (velocity, bungeecord, geyser...)
-   Add support for more server jars (only vanilla, paper, and purpur are supported at this time)
-   build bukkit and spigot jars and store them in a cache

## FAQ:

-   Why does ServerJars use a database instead of simply fetching the jars from the official websites?
    -   ServerJars uses a database to store links to the jars as it will be needed when bukkit and spigot jars are added, as they will have to be built from source. This also allows for the jars to be fetched from a local database instead of the official websites, which would be slower.
