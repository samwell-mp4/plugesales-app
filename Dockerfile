# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy build and server files
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY backend ./backend/

# Create uploads directory and define as volume
RUN mkdir -p uploads && chmod 777 uploads
VOLUME ["/app/uploads"]

# Expose port 3000
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]
