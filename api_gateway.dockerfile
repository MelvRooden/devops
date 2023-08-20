FROM node:18

WORKDIR /app

COPY api-gateway ./api-gateway
COPY middleware ./middleware
COPY package.json .

RUN npm i

EXPOSE 3000

CMD ["node", "api-gateway/index.js", "api-gateway"]