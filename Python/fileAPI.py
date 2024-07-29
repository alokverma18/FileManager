from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import os
import shutil

app = Flask(__name__)
CORS(app)

# Base path for the NAS drive
NAS_BASE_PATH = r'C:\Users\Alok\Desktop\\'

def parent(path):
    if path==NAS_BASE_PATH:
        return None
    else:
        return os.path.dirname(path)
    
    

@app.route('/list', methods=['GET'])
def list_files():
    print('Request to List contents')
    folder_path = os.path.join(NAS_BASE_PATH, request.args.get('path', ''))
    try:
        items = []
        for item in os.listdir(folder_path):
            item_path = os.path.join(folder_path, item)
            if os.path.isdir(item_path):
                items.append({"name": item, "type": "folder", "path": item_path.replace(NAS_BASE_PATH, ''), "parent": parent(item_path)})
            else:
                items.append({"name": item, "type": "file", "path": item_path.replace(NAS_BASE_PATH, ''), "parent": parent(item_path)})
        print(items)
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create-folder', methods=['POST'])
def create_folder():
    print('Request to create a new Folder')
    folder_path = os.path.join(NAS_BASE_PATH, request.json['path'])
    try:
        os.makedirs(folder_path, exist_ok=True)
        return jsonify({"message": "Folder created"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    print('Request to Upload')
    target_path = os.path.join(NAS_BASE_PATH, request.form['targetPath'])
    if not os.path.exists(target_path):
        return jsonify({"error": "Target path does not exist"}), 400
    file = request.files['file']
    file_path = os.path.join(target_path, file.filename)
    print(file_path)
    if os.path.exists(file_path):
        return jsonify({"error": "File with same name already exists"}), 400
    try:
        file.save(file_path)
        return jsonify({"message": "File uploaded"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download', methods=['GET'])
def download_file():
    print('Request to Download')
    file_path = os.path.join(NAS_BASE_PATH, request.args['path'])
    directory = os.path.dirname(file_path)
    filename = os.path.basename(file_path)
    try:
        return send_from_directory(directory, filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/copy', methods=['POST'])
def copy_file():
    source = os.path.join(NAS_BASE_PATH, request.json['source'])
    destination = os.path.join(NAS_BASE_PATH, request.json['destination'])
    try:
        shutil.copy2(source, destination)
        return jsonify({"message": "File copied"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/move', methods=['POST'])
def move_file():
    source = os.path.join(NAS_BASE_PATH, request.json['source'])
    destination = os.path.join(NAS_BASE_PATH, request.json['destination'])
    try:
        shutil.move(source, destination)
        return jsonify({"message": "File moved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
