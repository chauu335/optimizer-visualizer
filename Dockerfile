FROM node:18-bullseye-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

FROM node:18-bullseye-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/build ./build
COPY scripts ./scripts

EXPOSE 3000

CMD ["node", "scripts/start.js"]