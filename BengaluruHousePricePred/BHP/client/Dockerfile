# Use an official Node runtime as a base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# Build the React app (Vite defaults to 'dist' folder)
RUN npm run build && ls -la dist

# Install a static file server globally (using 'serve')
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Serve the built app from the 'dist' folder
CMD ["serve", "-s", "dist", "-l", "3000"]