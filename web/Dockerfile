# /api/Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js index.js
COPY public public

RUN npm install

EXPOSE 3000

CMD [ "node", "index.js" ]
