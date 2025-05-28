# build
FROM node:18 as builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY index.js .

# final
FROM node:18-slim

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

CMD [ "node", "index.js" ]
