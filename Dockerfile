FROM node:boron

WORKDIR /usr/src/app

# We do this so that the npm install/express are part of the early layers.
COPY package.json .

RUN node --max_semi_space_size=1 --max_old_space_size=198 --max_executable_size=148 \
      `which npm` install
COPY . .

EXPOSE 8080

CMD ["npm", "start"]