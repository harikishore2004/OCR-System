from fastapi import FastAPI, Request, File, UploadFile, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from src.util import SaveFile
from src.ImageConverter import Converter
from src.TextExtractor import Extractor
from src.DataBase import SessionLocal, CreateTables
from src.DbOperations import InsertOcrResults


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
     
     
@app.on_event("startup")
def on_startup():
    CreateTables()

@app.get("/", response_class=HTMLResponse)
async def read_root(request:Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
    })
    
@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db:Session = Depends(get_db)):
    
    try:
           
        allowed_types = ["application/pdf", "image/tiff"]  
        if file.content_type not in allowed_types:
            raise HTTPException(status_code = 400, detail=f"{file.content_type} is not supported")
        
        #save the uploaded documents
        file_path, ext = SaveFile(file, file.filename) 
        #converts the documents to .png format
        image_path = Converter(file_path, ext) 
        #Extract the text
        ocr_result = Extractor(image_path)
        #Databased insertion
        InsertOcrResults(db=db, page_count=len(image_path), file_name=file.filename, ocr_result=ocr_result)
        
        print("File Path -> ", file_path)
        print("Images Path -> ",image_path)
        
        return JSONResponse(
            status_code = 200,
            content={"message": "File Uploaded", "category": "success"}
        )
        
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail, "category": "error"}
        )
