FROM --platform=$BUILDPLATFORM node:16-alpine AS frontend-build
WORKDIR /tmp
COPY static/package*.json ./
COPY static/src ./src
COPY static/public ./public
RUN npm install
RUN PUBLIC_URL=/build npm run build

FROM python:3.9.5-alpine3.12
WORKDIR /tmp
COPY poetry.lock ./
COPY pyproject.toml ./
COPY feeder/ ./feeder
COPY --from=frontend-build /tmp/build ./static/build
COPY alembic.ini ./
COPY README.md ./
RUN apk add --no-cache --virtual .build-deps \
        build-base \
        libffi-dev \
        openssl-dev \
        py3-pip \
        python3-dev \
        git \
    && python -m pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir poetry cryptography==3.3.2 \
    && poetry install --no-dev -v\
    && apk del .build-deps \
    && rm -rf ~/.cache/pip \
    && rm -rf ~/.cache/pypoetry/{cache,artifacts}
CMD poetry run alembic upgrade head && poetry run python -m feeder
EXPOSE 1883/tcp
EXPOSE 5000/tcp
EXPOSE 8883/tcp
