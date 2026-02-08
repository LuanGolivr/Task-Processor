FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
EXPOSE 50051

CMD ["sh", "-c", "npm run db:deploy && node dist/src/index.js"]
