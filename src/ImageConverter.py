from pdf2image import convert_from_path
import os


def Converter(path:str, ext:str) -> list:
    
    image_paths = []
    filename = ""
    if(ext == "pdf"):
        parent_folder = os.path.dirname(path)
        images = convert_from_path(path)
        for i, img in enumerate(images):
            filename = f"{parent_folder}/{i+1}_page.png"
            img.save(filename, "PNG")
            image_paths.append(filename)
    
    return image_paths
    
        