FROM node:18

WORKDIR /app

COPY external-service ./external-service
COPY middleware ./middleware
COPY package.json ./
COPY rabbitmq.js ./

RUN mkdir -p /public/uploads
RUN npm i

EXPOSE 3003

CMD ["node", "external-service/index.js", "external-service"]