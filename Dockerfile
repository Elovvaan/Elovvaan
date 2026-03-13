FROM node:20-alpine
WORKDIR /app/prize-board-app/backend
COPY prize-board-app/backend/package*.json ./
RUN npm install
COPY prize-board-app/backend .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]