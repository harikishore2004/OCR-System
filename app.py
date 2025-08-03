from fastapi import FastAPI, Request, File, UploadFile, HTTPException, Depends, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from src.Util import SaveFile
from src.ImageConverter import Converter
from src.TextExtractor import TeserractExtractor, PaddleExtractor
from src.DataBaseSchema import Files, OCR_Results, SessionLocal, CreateTables
from src.DbOperations import InsertOcrResults, InsertFile
from src.Logger import Logger
from collections import defaultdict
import paddle
from paddleocr import PaddleOCR

app = FastAPI()
ocr_engine = None

app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
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
    paddle.set_flags({
        "FLAGS_fraction_of_cpu_memory_to_use": 0.5,
        "FLAGS_use_pinned_memory": False
    })
    global ocr_engine
    ocr_engine = PaddleOCR(
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        text_detection_model_dir="PaddleOcrModal/PP-OCRv5_mobile_det_infer",
        text_recognition_model_dir="PaddleOcrModal/PP-OCRv5_mobile_rec_infer",
        text_detection_model_name="PP-OCRv5_mobile_det",
        text_recognition_model_name="PP-OCRv5_mobile_rec",
        lang="en",
        cpu_threads=2
    )


@app.get("/", response_class=HTMLResponse)
async def read_root(request:Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
    })
    
@app.post("/upload")
async def upload_file(file: UploadFile = File(...), db:Session = Depends(get_db), engine: str = Form(...)):
    
    filename = f""
    try:
         
        logger = Logger(file_name=file.filename)
                   
        allowed_types = ["application/pdf", "image/tiff"]  
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code = 400, 
                detail={
                    "error": "File format is not supported",
                    "fname": "FileTypeDetector"
                }       
            )
        if engine not in ["paddleocr", "tesseract"]:
            raise HTTPException(
                status_code = 400, 
                detail={
                    "error": f"{engine} is not supported",
                    "fname": "EngineDetector"
                }       
            )     
        
        #save the uploaded documents
        file_path, ext = SaveFile(file, file.filename)
        logger.AddLog(db=db, function_name="SaveFile", status="success", message=f"Saved file to path - {file_path}")
        
        #converts the documents to .png format
        image_path = Converter(file_path, ext) 
        logger.AddLog(db=db, function_name="Converter", status="success", message=f"Image conversion completed")

        
        file_id = InsertFile(db=db, page_count=len(image_path), file_name=file.filename, engine=engine)
        logger.AddLog(db=db, function_name="InsertFile", status="success", message=f"File info inserted to DB")

        
        #Extract the text 
        if(engine == "tesseract"):
            ocr_result = TeserractExtractor(image_path)
            logger.AddLog(db=db, function_name="TeserractExtractor", status="success", message=f"Extracted text using Teserract engine")

        elif(engine == "paddleocr"):
            if(ocr_engine is not None):
                ocr_result = PaddleExtractor(ocr_engine=ocr_engine, image_paths=image_path)
                logger.AddLog(db=db, function_name="PaddleExtractor", status="success", message=f"Extracted text using Paddle engine")
     
        #Databased insertion
        InsertOcrResults(db=db, file_id=file_id, ocr_result=ocr_result)
        logger.AddLog(db=db, function_name="InsertOcrResults", status="success", message=f"Ocr results inserted to DB")

        logger.CommitLogs(db)
        return JSONResponse(
            status_code = 200,
            content={"message": "File Processed!", "category": "success"}
        )
        
    except HTTPException as e:
        
        logger.AddLog(db=db, function_name=e.detail.get("fname"), status="error", message=e.detail.get("error"))
        logger.CommitLogs(db=db)
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail.get("error"), "category": "error"}
        )

@app.get("/fetchdata")
def fetch_data(db:Session = Depends(get_db)):
    
    try:
        files = db.query(Files).all()
        rows = db.query(OCR_Results).all()
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"message": "Data Fetch Falied!", "category": "error"}
        )
        
    file_map = {f.id:{"file_name": f.file_name, "page_count": f.page_count, "engine": f.engine} for f in files}
    #print(file_map)
    
    singelpage_doc = defaultdict(lambda:defaultdict(list))
    multipage_doc = defaultdict(lambda:defaultdict(list))
    

    for row in rows:
        file_data = file_map.get(row.file_id)
        if not file_data:
            continue
        #print(file_data)
        entry = {
            "line_text": row.line_text,
            "x": row.x,
            "y": row.y,
            "width": row.width,
            "height": row.height,
            "timestamp": row.timestamp.strftime("%d %b %Y, %I:%M %p") if row.timestamp else None
            
        }
        
        file_name = f"{file_data["file_name"]}_id{row.file_id}"
        page_count = file_data["page_count"] 
        engine = file_data["engine"]       
        target_dict = singelpage_doc if page_count==1 else multipage_doc
        
        target_dict[file_name][str(row.page_number)].append(entry)
    return JSONResponse({
        "single_page_doc": singelpage_doc,
        "multi_page_doc": multipage_doc
    })
