# Use an official Node.js runtime as a parent image with the required version
FROM node:18.13.0-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Copy the wait-for-it.sh script from the root folder
#COPY ../wait-for-it.sh /usr/local/bin/wait-for-it.sh
#RUN chmod +x /usr/local/bin/wait-for-it.sh

# Build arguments for environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Conditionally run the build step based on the environment
RUN if [ "$NODE_ENV" = "production" ]; then yarn build; fi

# Expose the port that the app runs on
EXPOSE 4000

