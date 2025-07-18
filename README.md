# ![Favicon](./static/favicon.ico) OCR Web Application

This project is a Python-based web application that extracts text from PDF or TIFF documents using Optical Character Recognition (OCR). It is designed to streamline the process of uploading documents, extracting structured text data (including bounding box coordinates), and displaying the results in a user-friendly UI. The extracted data is also stored in a PostgreSQL database for further processing and analysis.

## 🔧 Tech Stack

- **Backend:** FastAPI (Python)
- **OCR Engine:** PaddleOCR or Tesseract (line-level bounding box extraction)
- **Frontend:** HTML, CSS, JavaScript (Bootstrap UI)
- **Database:** PostgreSQL
- **File Formats Supported:** PDF and TIFF (max file size: 10MB)
