FROM python:3.8
RUN pip install pipenv
COPY Pipfile* /tmp/
RUN cd /tmp && pipenv install --system --deploy --ignore-pipfile
COPY feeder/ /tmp/feeder
WORKDIR /tmp/feeder
RUN ./mkcert.py
CMD ./main.py
EXPOSE 1883/tcp
EXPOSE 5000/tcp
EXPOSE 7112/tcp
EXPOSE 8883/tcp
