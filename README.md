<h1 align="center">
  <img src="./static/favicon.ico" width="42" height="42" style="vertical-align: middle; margin-right: 10px;" />
  <span style="font-size: 28px; font-weight: bold;">OCR Web Application</span>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue.svg" />
  <img src="https://img.shields.io/badge/FastAPI-0.100%2B-brightgreen.svg" />
  <img src="https://img.shields.io/badge/OCR-Tesseract-orange" />
  <img src="https://img.shields.io/badge/OCR-PaddleOCR-blue" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue" />
  <img src="https://img.shields.io/badge/docker-image-blue?logo=docker" />
</p>

This project is a Python-based web application that extracts text from PDF or TIFF documents using Optical Character Recognition (OCR). It is designed to streamline the process of uploading documents, extracting structured text data (including bounding box coordinates), and displaying the results in a user-friendly UI. The extracted data is also stored in a PostgreSQL database for further processing and analysis.


<h2>🛠️ Tech Stack Used</h2>

<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technology</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Backend</strong></td>
      <td><a href="https://fastapi.tiangolo.com/">FastAPI</a></td>
      <td>High-performance API backend using Python</td>
    </tr>
    <tr>
      <td><strong>OCR Engine</strong></td>
      <td>
        <a href="https://github.com/tesseract-ocr/tesseract">Tesseract OCR</a><br>
        <a href="https://github.com/PaddlePaddle/PaddleOCR">PaddleOCR-light</a>
      </td>
      <td>Text extraction from images and scanned PDFs</td>
    </tr>
    <tr>
      <td><strong>Frontend</strong></td>
      <td>HTML, CSS, JavaScript (with <a href="https://getbootstrap.com/">Bootstrap</a>)</td>
      <td>Basic UI for file upload and results display</td>
    </tr>
    <tr>
      <td><strong>Database</strong></td>
      <td><a href="https://www.postgresql.org/">PostgreSQL</a></td>
      <td>Stores extracted text and bounding box data</td>
    </tr>
    <tr>
      <td><strong>Containerization</strong></td>
      <td>
        <a href="https://www.docker.com/">Docker</a>, 
        <a href="https://docs.docker.com/compose/">Docker Compose</a>
      </td>
      <td>Containerized environment for easy setup</td>
    </tr> 
  </tbody>
</table>

## 📂 Folder Structure

<pre>
.
├── <strong>app.py</strong>                     # FastAPI entry point for backend
├── <strong>docker-compose.yml</strong>         # Docker multi-service config
├── <strong>Dockerfile</strong>                 # Dockerfile for app image
├── <strong>modalsetup.sh</strong>              # Shell script to set up PaddleOCR models
├── <strong>PaddleOcrModal/</strong>            # Auto-created folder for PaddleOCR model files
│   ├── PP-OCRv5_mobile_det_infer/
│   └── PP-OCRv5_mobile_rec_infer/
├── <strong>README.md</strong>                  
├── <strong>requirements.txt</strong>           # Python dependencies
├── <strong>src/</strong>                       # Core backend logic and OCR workflow
│   ├── DataBaseSchema.py      # PostgreSQL table schema
│   ├── DbOperations.py        # DB insert/query functions
│   ├── ImageConverter.py      # PDF to image conversion logic
│   ├── TextExtractor.py       # OCR extraction for Tesseract/PaddleOCR
│   └── Util.py                # Common utility functions
├── <strong>static/</strong>                    # Frontend static files
│   ├── CSS/
│   │   └── main.css          
│   ├── favicon.ico          
│   └── JS/
│       ├── main.js                
├── <strong>templates/</strong>
│   └── index.html             
└── <strong>uploads/</strong>                   # Auto-created folder for user uploads
    ├── pdf/                   
    └── tiff/                  
</pre>

## Installation

### 1. Install Docker (Prerequisite)
To run this app, the only prerequisite is to have **Docker** installed on your system.
#### For Windows/ macOS
- Download Docker Desktop:
[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- Follow the installer instructions based on your OS.


#### For Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
```
#### Verify Docker is installed:
```
docker --version
```

### 2. Clone the Repository
```
git clone https://github.com/harikishore2004/OCR-System.git
cd OCR-System
```

### 3. Run the App with Docker
```
docker compose up --build  
```  
#### This will:
- Build the Docker Image
- Spin 2 Containers  **ocr_app**, **container_postgres_db**
- Start the FastAPI backedn server
- Automatically create required foleder `uploads/` and `PaddleOcrModal/`

### 4. Access the App
Once running, open your browser and visit:
```
http://localhost:8000
```

### Notes
- PaddleOCR models are auto-configured via `modalsetup.sh`
- If you modify source code, rebuild the app using:
```
docker-compose down
docker-compose up --build
```







