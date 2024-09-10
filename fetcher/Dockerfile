# /fetcher/Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY fetcher/package*.json ./

RUN npm install

COPY fetcher ./

EXPOSE 3001

CMD [ "node", "index.js" ]
