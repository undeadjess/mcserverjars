# /api/Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js ./

RUN npm install

EXPOSE 3002

CMD [ "node", "index.js" ]
