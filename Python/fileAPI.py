from flask import Flask, request, send_from_directory, jsonify, send_file, after_this_request
from flask_cors import CORS
import os
import datetime
import shutil
import tempfile

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

# Base path for the NAS drive
BASE_PATH = r'C:\\'

def parent(path):
    if path==BASE_PATH:
        return None
    else:
        return os.path.dirname(path)

def get_details(path):
    items = []
    with os.scandir(path) as dir:
        for entry in dir:
            items.append({"name": entry.name, "type": "folder" if entry.is_dir() else "file", "size": entry.stat().st_size, "path": entry.path.replace(BASE_PATH, ''), "date_created": datetime.datetime.fromtimestamp(entry.stat().st_ctime), "date_modified": datetime.datetime.fromtimestamp(entry.stat().st_mtime)})
    return items

@app.route('/list', methods=['GET'])
def list_files():
    print('Request to List contents')
    folder_path = os.path.join(BASE_PATH, request.args.get('path', ''))
    try:
        items = get_details(folder_path)
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create-folder', methods=['POST'])
def create_folder():
    print('Request to create a new Folder')
    folder_path = BASE_PATH + request.json['path']
    print(BASE_PATH + request.json['path'])
    print(folder_path)
    try:
        os.makedirs(folder_path, exist_ok=True)
        return jsonify({"message": "Folder created"}), 200
    except Exception as e:
        print(f"Error creating folder: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    print('Request to Upload')
    target_path = os.path.join(BASE_PATH, request.form['targetPath'])
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
        print(f"Error uploading file: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/download', methods=['GET'])
def download_file():
    print('Request to Download')
    file_path = os.path.join(BASE_PATH, request.args['path'])

    if os.path.isdir(file_path):
        try:
            temp_dir = tempfile.mkdtemp()
            zip_filename = os.path.join(temp_dir, "downloaded_directory.zip")
            shutil.make_archive(zip_filename.replace('.zip', ''), 'zip', file_path)
            @after_this_request
            def cleanup(response):
                try:
                    shutil.rmtree(temp_dir)
                except Exception as e:
                    app.logger.error(f"Error removing temporary files: {e}")
                return response
            return send_file(zip_filename, as_attachment=True)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        try:
            return send_file(file_path, as_attachment=True)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/copy', methods=['POST'])
def copy_file():
    source = os.path.join(BASE_PATH, request.json['source'])
    destination = BASE_PATH + request.json['destination']
    print(f"Copying from {source} to {destination}")
    try:
        if os.path.isdir(source):
            shutil.copytree(source, destination)
            return jsonify({"message": "Folder copied"}), 200
        
        else:
            shutil.copy2(source, destination)
            return jsonify({"message": "File copied"}), 200

    except Exception as e:
        print(f"Error copying file: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/move', methods=['POST'])
def move_file():
    source = os.path.join(BASE_PATH, request.json['source'])
    destination = os.path.join(BASE_PATH, request.json['destination'])
    print(source, destination)
    try:
        shutil.move(source, destination)
        return jsonify({"message": "File moved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/delete', methods=['POST'])
def delete_file():
    file_path = os.path.join(BASE_PATH, request.json['path'])
    try:
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)
        return jsonify({"message": "File/Folder deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rename a file or folder
@app.route('/rename', methods=['POST'])
def rename_file():
    old_path = os.path.join(BASE_PATH, request.json['path'])
    new_name = request.json['newName']
    old_extension = os.path.splitext(old_path)[1] if os.path.isfile(old_path) else ''
    new_path = os.path.join(parent(old_path), new_name + old_extension)
    
    print(old_path)
    print(new_path)
    
    try:
        os.rename(old_path, new_path)
        return jsonify({"message": "File/Folder renamed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
