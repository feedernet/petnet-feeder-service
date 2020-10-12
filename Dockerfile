FROM python:3.8
RUN pip install pipenv
COPY Pipfile* /tmp/
RUN cd /tmp && pipenv install --system --deploy --ignore-pipfile
COPY feeder/ /tmp/feeder
COPY static/ /tmp/static
COPY alembic.ini /tmp
COPY setup.py /tmp
COPY README.md /tmp
RUN cd /tmp && pip install .
RUN ls -al /usr/local/lib/python3.8/site-packages/feeder/
WORKDIR /tmp
CMD alembic upgrade head && python -m feeder
EXPOSE 1883/tcp
EXPOSE 5000/tcp
EXPOSE 8883/tcp
