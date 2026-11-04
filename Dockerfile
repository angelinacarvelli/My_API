FROM node:18-alpine
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]