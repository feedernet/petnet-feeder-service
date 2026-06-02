FROM --platform=$BUILDPLATFORM node:24-alpine AS frontend-build
WORKDIR /tmp
COPY static/package*.json ./
COPY static/.npmrc ./
COPY static/vite.config.js ./
COPY static/index.html ./
COPY static/src ./src
COPY static/public ./public
RUN npm ci
RUN npm run build

FROM python:3.14-alpine
WORKDIR /tmp
COPY poetry.lock ./
COPY pyproject.toml ./
COPY feeder/ ./feeder
COPY --from=frontend-build /tmp/dist ./static/build
COPY alembic.ini ./
COPY README.md ./
# This has a hack with pip to get around the fact that poetry doesn't handle extra index URLs correctly yet
RUN apk add --no-cache --virtual .build-deps \
        build-base \
        cargo \
        libffi-dev \
        musl-dev \
        openssl-dev \
        py3-pip \
        python3-dev \
        git \
        jq \
    && python -m pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir poetry yq --extra-index-url https://www.piwheels.org/simple \
    && cat poetry.lock | tomlq -r '.package[] | select(.category == "main") | select(.source == null) | "\(.name)==\(.version)"' | xargs poetry run pip install --no-cache-dir --extra-index-url https://www.piwheels.org/simple \
    && poetry install --no-dev -v \
    && apk del .build-deps \
    && rm -rf ~/.cache/pip \
    && rm -rf ~/.cache/pypoetry/{cache,artifacts}
RUN adduser -D appuser && chown -R appuser /tmp
USER appuser
CMD poetry run alembic upgrade head && poetry run python -m feeder
EXPOSE 1883/tcp
EXPOSE 5000/tcp
EXPOSE 8883/tcp
