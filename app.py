from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from src.util import SaveFile
from src.ImageConverter import Converter
from src.TextExtractor import Extractor
from src.DataBase import SessionLocal, CreateTables


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.on_event("startup")
def on_startup():
    CreateTables()

@app.get("/", response_class=HTMLResponse)
async def read_root(request:Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
    })
    
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    allowed_types = ["application/pdf", "image/tiff"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"{file.content_type} is not supported")

    file_path, ext = SaveFile(file, file.filename)
    image_path = Converter(file_path, ext)
    
    text_data = Extractor(image_path)
    print("File Path -> ", file_path)
    print("Images Path -> ",image_path)
    for i, text in enumerate(text_data):
        print(f"Page {i+1} Data -----------------------------")
        for j in text:
            print(j['text'])
            
        print(" ")
    print("Pages = ", len(text_data))
    return JSONResponse(content={"message": "File Uploaded", "category": "success"}, status_code=200)