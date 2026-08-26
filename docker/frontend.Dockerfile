FROM node:24.15.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json
RUN npm ci
COPY frontend frontend
RUN npm run build --workspace frontend

FROM node:24.15.0-alpine AS runtime
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build /app/frontend/dist/frontend ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
USER node
CMD ["node", "dist/server/server.mjs"]
