FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Kolkata

RUN apt-get update && \
    apt-get install -y \
        tesseract-ocr \
        libtesseract-dev \
        poppler-utils \
        libgl1 \
        tzdata && \
    ln -fs /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app/

RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x modalsetup.sh \ 
    ./modalsetup.sh

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
