FROM --platform=$BUILDPLATFORM node:14-alpine AS frontend-build
WORKDIR /tmp
COPY static/package*.json ./
COPY static/src ./src
COPY static/public ./public
RUN npm install
RUN PUBLIC_URL=/{{build_path}} npm run build

FROM python:3.8-alpine
RUN apk add --no-cache --virtual .build-deps \
        build-base \
        libffi-dev \
        openssl-dev \
        py3-pip \
        python3-dev \
        git
RUN pip install pipenv
WORKDIR /tmp
COPY Pipfile* ./
RUN pipenv install --system --deploy --ignore-pipfile
COPY feeder/ ./feeder
COPY --from=frontend-build /tmp/build ./static/build
COPY alembic.ini ./
COPY setup.py ./
COPY README.md ./
RUN pip install .
RUN apk del .build-deps
CMD alembic upgrade head && python -m feeder
EXPOSE 1883/tcp
EXPOSE 5000/tcp
EXPOSE 8883/tcp
