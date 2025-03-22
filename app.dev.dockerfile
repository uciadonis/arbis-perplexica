FROM node:20.18.0-slim

WORKDIR /home/perplexica

COPY package.json yarn.lock ./

COPY tsconfig.json next.config.mjs next-env.d.ts postcss.config.js drizzle.config.ts tailwind.config.ts ./
COPY src ./src
COPY public ./public

RUN mkdir -p /home/perplexica/data
RUN mkdir -p /home/perplexica/uploads

RUN yarn install

CMD ["yarn", "dev"]