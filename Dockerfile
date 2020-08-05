FROM node:14-alpine AS ui
WORKDIR /app
COPY frontend/yarn.lock frontend/package.json ./
RUN yarn install
COPY frontend/ ./
RUN yarn build


FROM python:3.8
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
COPY --from=ui /app/build .
CMD ["python","app.py"]

