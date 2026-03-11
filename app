# render ignore
*
!render.yaml
!prize-board-app/**
services:
  - type: web
    name: backend
    env: docker
    dockerfilePath: prize-board-app/backend/Dockerfile
    plan: starter
    autoDeploy: true

  - type: web
    name: admin
    env: docker
    dockerfilePath: prize-board-app/admin/Dockerfile
    plan: starter
    autoDeploy: true

  - type: worker
    name: worker
    env: docker
    dockerfilePath: prize-board-app/worker/Dockerfile
    plan: starter
    autoDeploy: true

databases:
  - name: postgres
    plan: starter

redis:
  - name: redis
    plan: starter
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "start:prod"]
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "start:worker"]
