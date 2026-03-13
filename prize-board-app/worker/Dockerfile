FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000

# Default for development, override in production
ENV JWT_SECRET=change-me-in-production

CMD ["npm", "run", "start:worker"]
