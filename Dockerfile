FROM node:boron

WORKDIR /usr/src/app

# We do this so that the npm install/express are part of the early layers.
COPY package.json .

RUN npm install
RUN npm install express

COPY . .

EXPOSE 8080

CMD ["npm", "start"]