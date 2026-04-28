FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production dependencies for backend)
# Alternatively we could install all, but let's install what's in package.json.
RUN npm install --production=false

# Copy only the server directory and any root level configuration files
# required by the backend
COPY server/ ./server/
COPY .env* ./

# Expose the proxy port
EXPOSE 8787

# Command to run the proxy
CMD ["npm", "run", "finance-chat-proxy"]
