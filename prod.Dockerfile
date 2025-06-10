FROM node:22-alpine

WORKDIR /app
COPY . /app/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

CMD ["pnpm", "run", "migrateandstart"]