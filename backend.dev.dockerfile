FROM node:20.18.0-slim

WORKDIR /home/perplexica

COPY src /home/perplexica/src
COPY tsconfig.json /home/perplexica/
COPY drizzle.config.ts /home/perplexica/
COPY package.json /home/perplexica/
COPY yarn.lock /home/perplexica/

RUN mkdir /home/perplexica/data
RUN mkdir /home/perplexica/uploads

RUN yarn install

CMD ["yarn", "dev"]