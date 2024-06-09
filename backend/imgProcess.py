import os
import glob
import zipfile
from io import BytesIO
from flask import jsonify
from PIL import Image, ImageOps, ImageEnhance
from werkzeug.utils import secure_filename


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

class imgProcess:
    def __init__(self,fName,fAction,UPLOAD_FOLDER,EDIT_FOLDER):
        self.allfiles = fName
        self.operation = fAction.getlist('actions')
        self.values = fAction
        self.UPLOAD_FOLDER = UPLOAD_FOLDER
        self.EDIT_FOLDER = EDIT_FOLDER
    
    def allowed_file(self,filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def validate(self):
        allFiles = self.allfiles
        for data in allFiles:
            file = allFiles[data]
            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400

            if file and self.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(self.UPLOAD_FOLDER, filename)
                file.save(filepath)
            else:
                files = glob.glob(f'{self.UPLOAD_FOLDER}/*')
                for f in files:
                    os.remove(f)
                return jsonify({'error': 'File type not allowed'}), 400
        return

    def operateOnImage(self):
        actions = self.operation
        for f in os.listdir(os.path.join(self.UPLOAD_FOLDER)):
            if f == 'temp.txt':
                continue
            with Image.open(f'{self.UPLOAD_FOLDER}/{f}') as im:
                for action in actions:
                    if action == "Square":
                        size = (1920, 1920)
                        im = ImageOps.pad(im, size,Image.LANCZOS, color="#000")
                    if action == "sharp":
                        factor = round(1 + int(self.values['sharp_value'])/100,2)
                        im = ImageEnhance.Sharpness(im).enhance(factor)
                    if action == "contrast":
                        factor = round(1 + int(self.values['contrast_value'])/100,2)
                        im = ImageEnhance.Contrast(im).enhance(factor)
                    if action == "bright":
                        factor = round(1 + int(self.values['bright_value'])/100,2)
                        im = ImageEnhance.Brightness(im).enhance(factor)
                    if action == "BNW":
                        im = im.convert("L")
            
                im.save(os.path.join(self.EDIT_FOLDER,f"edited_{f}"))
        return
    
    def doZip(self):
        memory_file = BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.EDIT_FOLDER):
                        for file in files:
                                if file == 'temp.txt':
                                    continue
                                zipf.write(os.path.join(root, file))
        memory_file.seek(0)
        files = glob.glob(f'{self.UPLOAD_FOLDER}/*')
        for f in files:
            if f == f'{self.UPLOAD_FOLDER}\\temp.txt':
                continue
            os.remove(f)
        files = glob.glob(f'{self.EDIT_FOLDER}/*')
        for f in files:
            if f == f'{self.EDIT_FOLDER}\\temp.txt':
                continue
            os.remove(f)
        
        return memory_file
    
