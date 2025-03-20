# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app

# Leverage caching by installing dependencies first
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the application code and build for production
COPY . ./
RUN npm run build


# Stage 2: Development environment
FROM node:20-alpine AS dev
WORKDIR /app

# Install dependencies again for development
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the full source code
COPY . ./

# Expose port for the development server
EXPOSE 3000
CMD ["npm", "start"]


# Stage 3: Production environment
FROM nginx:alpine AS prod

# Copy the production build artifacts from the build stage
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/

# Expose the default NGINX port
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]