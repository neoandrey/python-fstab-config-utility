FROM python:3.6-alpine

RUN adduser -D cs3p

WORKDIR /home/cs3p

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt
RUN venv/bin/pip install gunicorn pymysql

COPY app app
COPY migrations migrations
COPY cs3p.py config.py boot.sh ./
RUN chmod a+x boot.sh

ENV FLASK_APP cs3p.py

RUN chown -R cs3p:cs3p ./
USER cs3p

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]
