# Use the official Node.js image as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

#Install ts-node and nodemon globally
RUN npm install -g ts-node nodemon

RUN apt-get update && apt-get install -y netcat-openbsd

# Copy the rest of the application files
COPY . .

RUN npx prisma generate

# Build the NestJS application
RUN npm run build

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Expose the application port
EXPOSE 3000

# Use custom entrypoint
CMD ["/usr/src/app/entrypoint.sh"]
