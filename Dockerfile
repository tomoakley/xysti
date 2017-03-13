FROM node:boron

# create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app
RUN npm install

# Bundle App source
COPY . /usr/src/app

# Expose web app, server and chatbot ports
EXPOSE 3000
EXPOSE 3030
EXPOSE 4000

CMD [ "npm run", "dev" ]
