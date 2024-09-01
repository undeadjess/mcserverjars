# mcserverjars
An API to get the latest Minecraft server jar download link.
#### Usage:
`GET /api/<type>/<jar>/<version>/<build>`
- type: The type of the server jar. (Server, Proxys coming soon!)
- jar: The server jar file to download. (vanilla, paper, forge)
- version: The minecraft version of the jar. (1.16.5, 1.17.1)
- build: The build number of the server jar. Only for non-vanilla servers (1, 2, 3, ...)

if the build number is not specified, the latest build will be returned.
if neither the version or build number is specified, the latest version will be returned.

#### Examples:
`GET /api/Server/paper/1.17.1/142`
Returns the download link for the 142nd build of the 1.17.1 paper server jar.

`GET /api/Server/paper/1.16.5`
Returns the download link for the latest build of the 1.16.5 paper server jar.

`GET /api/Server/paper`
Returns the download link for the latest build of the latest version of the paper server jar.

#### To-Do:
- Add support for proxys (velocity, bungeecord, geyser...)
- Add support for more server jars (only vanilla is supported at this time)
- move to docker