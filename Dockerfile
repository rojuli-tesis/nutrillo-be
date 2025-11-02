# Use an official Node.js runtime as a parent image with the required version
FROM node:18.13.0-alpine

# Set the working directory
WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies using Yarn (including devDependencies needed for build)
RUN yarn install --frozen-lockfile --production=false

# Copy the rest of the application code
COPY . .

# Build arguments for environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Conditionally run the build step based on the environment
RUN if [ "$NODE_ENV" = "production" ]; then yarn build; fi

# Expose the port that the app runs on
EXPOSE 4000

# Start the application
CMD ["node", "dist/main"]

