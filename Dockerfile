FROM node:8
EXPOSE 80

WORKDIR /usr/local/src
COPY . .

RUN yarn

CMD [ "node", "index.js" ]