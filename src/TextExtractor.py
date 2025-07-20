import pytesseract
from PIL import Image, ImageDraw
from collections import defaultdict

# def DrawBox(image: Image.Image, boxes: list, save_path: str):
#     draw = ImageDraw.Draw(image)
#     for box in boxes:
#         x, y, w, h = box['x'], box['y'], box['width'], box['height']
#         draw.rectangle([x, y, x+w, y+h], fill='green', width=1)
        
#     image.save(save_path)
    
def Extractor(image_paths:list) -> list[dict]:
    output = []
    for path in image_paths:  
        line_result = []
        image = Image.open(path) 
        ocr_data = pytesseract.image_to_data(image=image, output_type=pytesseract.Output.DICT)
        
        lines = defaultdict(list) 
        word_count = len(ocr_data['text'])
        
        for i in range(word_count):
            if ocr_data['text'][i].strip():
                key = (ocr_data['block_num'][i], ocr_data['par_num'][i], ocr_data['line_num'][i])
                value = {
                    'text': ocr_data['text'][i],
                    'x': ocr_data['left'][i],
                    'y': ocr_data['top'][i],
                    'width': ocr_data['width'][i],
                    'height': ocr_data['height'][i]
                }
                lines[key].append(value)
         
       
        
        for word_list in lines.values():
            line_text = ' '.join([w['text'] for w in word_list])
            
            #bounding box caluculation
            #coordinates of top left corner fo bounding box
            x_min = min(w['x'] for w in word_list)
            y_min = min(w['y'] for w in word_list)
            
            #coordinates of bottom most corner of bounding box
            x_max = max(w['x'] + w['width'] for w in word_list)
            y_max = max(w['y'] + w['height'] for w in word_list)
            
            width = x_max - x_min
            height = y_max - y_min
                        
            
            line_result.append({
                'text': line_text,
                'x': x_min,
                'y': y_min,
                'width': width,
                'height': height
            })
        
            # DrawBox(image=image, boxes=line_result, save_path=path)
        output.append(line_result)
    return output
                
        
        