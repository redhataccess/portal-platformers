FROM node:boron

WORKDIR /usr/src/app

COPY package.json .

RUN npm install
RUN npm install express

COPY . .

EXPOSE 8080

CMD ["npm", "start"]