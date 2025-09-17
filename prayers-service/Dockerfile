# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Run prisma generate
RUN npx prisma generate

# Expose port
EXPOSE 4003

# Start app
CMD ["node", "server.js"]
