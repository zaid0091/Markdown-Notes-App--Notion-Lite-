FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

# Expose Vite dev server on host 0.0.0.0 for container networking access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
