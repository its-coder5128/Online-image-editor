import os
from flask import Flask, request, send_file
from flask_cors import CORS
from imgProcess import imgProcess
from dotenv import load_dotenv

load_dotenv()

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER_DIR')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
EDIT_FOLDER = os.getenv('EDIT_FOLDER_DIR')
if not os.path.exists(EDIT_FOLDER):
    os.makedirs(EDIT_FOLDER)

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['EDIT_FOLDER'] = EDIT_FOLDER

@app.route('/', methods=['GET'])
def BaseURL():
    return "GET YOUR IMAGES EDITED GO TO https://online-image-editor-two.vercel.app/"

@app.route('/uploadFiles', methods=['POST'])
def upload_file():

    allFiles = request.files
    actions = request.form

    if len(allFiles) == 0:
        return "no file"

    fileHandler = imgProcess(allFiles,actions,app.config['UPLOAD_FOLDER'],app.config['EDIT_FOLDER'])

    fileHandler.validate()
    
    fileHandler.operateOnImage()
    
    memory_file = fileHandler.doZip()

    return send_file(memory_file, mimetype='application/zip')
    

if __name__ == '__main__':
    app.run()
