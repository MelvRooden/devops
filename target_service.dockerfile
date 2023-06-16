FROM node:18

WORKDIR /app

COPY target-service ./target_service
COPY package.json ./

RUN npm i

EXPOSE 3002

CMD ["node", "target_service/index.js", "target-service"]