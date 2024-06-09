import os
from flask import Flask, request, send_file
from flask_cors import CORS
from imgProcess import imgProcess

UPLOAD_FOLDER = './upload'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
EDIT_FOLDER = './Edited'
if not os.path.exists(EDIT_FOLDER):
    os.makedirs(EDIT_FOLDER)

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['EDIT_FOLDER'] = EDIT_FOLDER


@app.route('/uploadFiles', methods=['POST'])
def upload_file():

    allFiles = request.files
    actions = request.form

    fileHandler = imgProcess(allFiles,actions,app.config['UPLOAD_FOLDER'],app.config['EDIT_FOLDER'])

    fileHandler.validate()
    
    fileHandler.operateOnImage()
    
    memory_file = fileHandler.doZip()

    return send_file(memory_file, mimetype='application/zip')
    

if __name__ == '__main__':
    app.run(debug=True)
