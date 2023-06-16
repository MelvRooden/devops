FROM node:18

WORKDIR /app

COPY external-service ./auth_service
COPY package.json ./

RUN npm i

EXPOSE 3003

CMD ["node", "external_service/index.js", "external-service"]