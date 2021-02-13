FROM --platform=$BUILDPLATFORM node:fermium-buster-slim AS frontend-build
WORKDIR /tmp
COPY static/package*.json ./
COPY static/src ./src
COPY static/public ./public
RUN npm install
RUN PUBLIC_URL=/{{build_path}} npm run build

FROM python:3.8-slim-buster
WORKDIR /tmp
COPY poetry.lock ./
COPY pyproject.toml ./
COPY feeder/ ./feeder
COPY --from=frontend-build /tmp/build ./static/build
COPY alembic.ini ./
COPY README.md ./
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    git \
    && python -m pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir poetry cryptography==3.3.2 \
    && poetry install -v --no-dev \
    && rm -rf ~/.cache \
    && apt-get -y remove \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    git \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
CMD poetry run alembic upgrade head && poetry run python -m feeder
EXPOSE 1883/tcp
EXPOSE 5000/tcp
EXPOSE 8883/tcp
