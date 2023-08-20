FROM node:18

WORKDIR /app

COPY target-service ./target-service
COPY middleware ./middleware
COPY package.json ./
COPY rabbitmq.js ./

RUN mkdir -p /public/uploads
RUN npm i

EXPOSE 3002

CMD ["node", "target-service/index.js", "target-service"]