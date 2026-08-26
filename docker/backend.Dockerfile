FROM node:24.15.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json
RUN npm ci
COPY backend backend
RUN npm run build --workspace backend

FROM node:24.15.0-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
