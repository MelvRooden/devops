FROM node:18

WORKDIR /app

COPY auth-service ./auth-service
COPY middleware ./middleware
COPY package.json ./
COPY rabbitmq.js ./

RUN npm i

EXPOSE 3001

CMD ["node", "auth-service/index.js", "auth-service"]