FROM node:18

WORKDIR /app

COPY auth-service ./auth_service
COPY package.json ./
COPY middleware ./middleware
COPY rabbitmq.js ./

RUN npm i

EXPOSE 3001

CMD ["node", "auth_service/index.js", "auth-service"]