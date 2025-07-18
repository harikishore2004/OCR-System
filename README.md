<h1 align="center">
  <img src="./static/favicon.ico" width="42" height="42" style="vertical-align: middle; margin-right: 10px;" />
  <span style="font-size: 28px; font-weight: bold;">OCR Web Application</span>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue.svg" />
  <img src="https://img.shields.io/badge/FastAPI-0.100%2B-brightgreen.svg" />
  <img src="https://img.shields.io/badge/OCR-Tesseract%20%7C%20PaddleOCR-orange" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue" />
</p>


This project is a Python-based web application that extracts text from PDF or TIFF documents using Optical Character Recognition (OCR). It is designed to streamline the process of uploading documents, extracting structured text data (including bounding box coordinates), and displaying the results in a user-friendly UI. The extracted data is also stored in a PostgreSQL database for further processing and analysis.

## 🔧 Tech Stack

- **Backend:** FastAPI (Python)
- **OCR Engine:** PaddleOCR or Tesseract (line-level bounding box extraction)
- **Frontend:** HTML, CSS, JavaScript (Bootstrap UI)
- **Database:** PostgreSQL
- **File Format