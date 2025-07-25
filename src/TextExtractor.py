import pytesseract
from PIL import Image
from paddleocr import PaddleOCR
import paddle
from collections import defaultdict
from fastapi import HTTPException

def TeserractExtractor(image_paths:list) -> list[list[dict]]:
    try:
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
    except Exception as e:
        raise HTTPException(
            status_code = 500, 
            detail=f"Text extraction using Terserract failed"
            )
                
        
def PaddleExtractor(image_paths:list) -> list[list[dict]]:  
    try:   
        paddle.set_flags({
        "FLAGS_fraction_of_cpu_memory_to_use": 0.5,  
        "FLAGS_use_pinned_memory": False
        })
        ocr = PaddleOCR(
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
        output = []
        
        for path in image_paths:
            line_result = []
            result = ocr.predict(path)
            for res in result:
                # res.print()
                # res.save_to_img("output/optimized")
                # res.save_to_json("output/optimized")
                
                for text, score, box in zip(res["rec_texts"], res["rec_scores"], res["rec_boxes"]):
                    x = int(box[0])
                    y = int(box[1])
                    width = int(box[2] - box[0])
                    height = int(box[3] - box[1])
                    #print(f"Text is: {text}, Score is: {score}, Box: {x}, {y}, {width}, {height}")
                    line_result.append({
                        'text': text,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height
                    })
            output.append(line_result)
        return output
 
    except Exception as e:
        raise HTTPException(
            status_code = 500, 
            detail=f"Text extraction using Paddle OCR failed"
            )
    

    
   