# Use an official Node.js runtime as a parent image with the required version
FROM node:18.13.0-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install wget for health checks
RUN apk add --no-cache wget

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build arguments for environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install dependencies again to catch any newly added packages
RUN yarn install --frozen-lockfile

# Conditionally run the build step based on the environment
RUN if [ "$NODE_ENV" = "production" ]; then yarn build; fi

# Expose the port that the app runs on
EXPOSE 4000

# Start the application
CMD ["node", "dist/main"]

