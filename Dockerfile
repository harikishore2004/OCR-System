FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y tesseract-ocr libtesseract-dev poppler-utils libgl1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app/

RUN python -m pip install paddlepaddle==3.0.0 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/
RUN python -m pip install paddleocr
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod +x modalsetup.sh
RUN ./modalsetup.sh

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
