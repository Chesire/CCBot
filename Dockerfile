FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create data directory for databases
RUN mkdir -p /app/data

# Change to data directory for runtime (databases will be created here)
WORKDIR /app/data

# Run the bot from /app (but databases write to /app/data)
CMD ["node", "/app/index.js"]
