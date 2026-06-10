# Step 1: Use an official Node.js runtime as a parent image
# We use the 'alpine' version for a significantly smaller image size
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json first
# This leverages Docker cache to save time if your dependencies haven't changed
COPY package*.json ./

# Step 4: Install dependencies
# Using npm install because the lockfile might be out of sync locally
RUN npm install --omit=dev

# Step 5: Copy the rest of the application source code
COPY . .

# Step 6: Define environment variables (Can be overridden at runtime)
ENV PORT=5000
ENV NODE_ENV=production

# Step 7: Expose the port your app runs on
EXPOSE 5000

# Step 8: Define the command to run your app
CMD ["npm", "start"]
