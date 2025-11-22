FROM node:18-alpine

WORKDIR /app

# Install MySQL client
RUN apk add --no-cache mysql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run application
CMD ["node", "server.js"]
