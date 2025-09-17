# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps, since prisma generate needs them)
RUN npm install

# Copy source code
COPY . .

# Run prisma generate
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start app
CMD ["node", "server.js"]
