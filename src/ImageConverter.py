from pdf2image import convert_from_path
from PIL import Image
import os


def Converter(path:str, ext:str) -> list[str]:
    image_paths = []
    filename = ""
    parent_folder = os.path.dirname(path)
    if(ext == "pdf"):
        images = convert_from_path(path)
        for i, img in enumerate(images):
            filename = f"{parent_folder}/{i+1}_page.png"
            img.save(filename, "PNG")
            image_paths.append(filename)
            
    elif(ext == "tiff"):
        with Image.open(path) as img:
            for i in range(img.n_frames):
                img.seek(i)
                filename = os.path.join(parent_folder, f"{i+1}_page.png")
                img.save(filename, "PNG")
                image_paths.append(filename)
    else:
        raise ValueError("Unsupported file conversion")
    return image_paths
    
        