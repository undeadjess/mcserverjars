# /fetcher/Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js index.js

RUN npm install

CMD [ "node", "index.js" ]
