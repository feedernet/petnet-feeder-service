FROM node:fermium-buster-slim AS frontend-build
WORKDIR /tmp
COPY static/package*.json ./
COPY static/src ./src
COPY static/public ./public
RUN npm install
RUN PUBLIC_URL=/{{build_path}} npm run build

FROM python:3.8-slim-buster
RUN apt-get update && \
    apt-get -y install --no-install-recommends git
RUN python -m pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir poetry cryptography==3.3.2
WORKDIR /tmp
COPY poetry.lock ./
COPY pyproject.toml ./
COPY feeder/ ./feeder
COPY --from=frontend-build /tmp/build ./static/build
COPY alembic.ini ./
COPY README.md ./
RUN poetry install -v --no-dev && \
    rm -rf ~/.cache
RUN apt-get -y remove git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
CMD poetry run alembic upgrade head && poetry run python -m feeder
EXPOSE 1883/tcp
EXPOSE 5000/tcp
EXPOSE 8883/tcp
