FROM oven/bun:latest as base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Build the application
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build

# Run the application
FROM node:20-slim AS release
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .

# Set environment variables for production
ENV NODE_ENV=production

EXPOSE 3000
CMD [ "npm", "run", "start" ]
