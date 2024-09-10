# /api/Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY api/package*.json ./

RUN npm install

COPY api ./

EXPOSE 3002

CMD [ "node", "index.js" ]
