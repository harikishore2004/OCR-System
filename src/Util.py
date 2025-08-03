from pathlib import Path
from fastapi import HTTPException
from fastapi import UploadFile
import os
import datetime


def EnsureFolder(path:str):
    if not os.path.exists(path):
        Path(path).mkdir(parents=True, exist_ok=True)
    else:
        raise HTTPException(
            status_code = 500,
            detail="File already exists, Rename your file"
        )
             
def SaveFile(file: UploadFile, filename:str):
    
    try:  
        temp = filename.split(".")
        timestamp = datetime.datetime.now().strftime("%d%m%Y_%H%M%S")
        folder_name = f"{temp[0]}_{timestamp}"
        ext = temp[1]
        file_path = ""
        
        if(".pdf" in filename):
            EnsureFolder(f"uploads/pdf/{folder_name}")
            file_path = f"uploads/pdf/{folder_name}/{filename}"
            Path(file_path).touch(exist_ok=True)
            
        elif(".tiff" in filename):
            EnsureFolder(f"uploads/tiff/{folder_name}")
            file_path = f"uploads/tiff/{folder_name}/{filename}"
            Path(file_path).touch(exist_ok=True)
            
        else:
            raise ValueError("Unsupported file type")
        
        with open(file_path, "wb") as f:
            f.write(file.file.read()) 
            
        return file_path, ext
 
    except Exception as e:
        
        raise HTTPException(
            status_code = 500, 
            detail={
                "error": "File save failed",
                "fname": "SaveFile"
            }       
        )

    

    
    