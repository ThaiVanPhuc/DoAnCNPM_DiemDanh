from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import face_recognition
import os
import base64
from datetime import datetime
import pickle
import json

app = Flask(__name__)
CORS(app)

# Cấu hình thư mục
UPLOAD_FOLDER = 'face_data/uploads'
TRAINING_FOLDER = 'face_data/training'
ENCODINGS_FILE = 'face_data/encodings.pkl'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TRAINING_FOLDER, exist_ok=True)

# Lưu trữ encodings và tên
known_face_encodings = []
known_face_names = []

# Load encodings đã lưu (nếu có)
def load_encodings():
    global known_face_encodings, known_face_names
    if os.path.exists(ENCODINGS_FILE):
        with open(ENCODINGS_FILE, 'rb') as f:
            data = pickle.load(f)
            known_face_encodings = data['encodings']
            known_face_names = data['names']
        print(f"✅ Đã load {len(known_face_names)} khuôn mặt")

def save_encodings():
    with open(ENCODINGS_FILE, 'wb') as f:
        pickle.dump({
            'encodings': known_face_encodings,
            'names': known_face_names
        }, f)
    print(f"💾 Đã lưu {len(known_face_names)} encodings")

load_encodings()

# Helper function: decode base64 image
def decode_base64_image(image_data):
    if 'base64,' in image_data:
        image_data = image_data.split('base64,')[1]
    image_bytes = base64.b64decode(image_data)
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image

# 1. Upload ảnh chân dung
@app.route('/api/upload-face', methods=['POST'])
def upload_face():
    try:
        data = request.get_json()
        name = data.get('name')
        image_data = data.get('image')
        
        if not name or not image_data:
            return jsonify({'error': 'Thiếu tên hoặc ảnh'}), 400
        
        image = decode_base64_image(image_data)
        
        # Lưu ảnh
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{name}_{timestamp}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        cv2.imwrite(filepath, image)
        
        return jsonify({
            'success': True,
            'message': 'Upload ảnh thành công',
            'filename': filename,
            'path': filepath
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 2. Chụp ảnh webcam
@app.route('/api/capture-webcam', methods=['POST'])
def capture_webcam():
    try:
        data = request.get_json()
        name = data.get('name')
        image_data = data.get('image')
        
        if not name or not image_data:
            return jsonify({'error': 'Thiếu tên hoặc ảnh'}), 400
        
        image = decode_base64_image(image_data)
        
        # Lưu ảnh
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{name}_webcam_{timestamp}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        cv2.imwrite(filepath, image)
        
        return jsonify({
            'success': True,
            'message': 'Chụp ảnh thành công',
            'filename': filename
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. Training khuôn mặt
@app.route('/api/train-face', methods=['POST'])
def train_face():
    try:
        data = request.get_json()
        name = data.get('name')
        image_path = data.get('image_path', None)
        
        if not name:
            return jsonify({'error': 'Thiếu tên'}), 400
        
        # Lấy ảnh
        if image_path and os.path.exists(image_path):
            images = [cv2.imread(image_path)]
        else:
            images = []
            for filename in os.listdir(UPLOAD_FOLDER):
                if filename.startswith(name):
                    img_path = os.path.join(UPLOAD_FOLDER, filename)
                    images.append(cv2.imread(img_path))
        
        if not images:
            return jsonify({'error': 'Không tìm thấy ảnh'}), 404
        
        # Training
        trained_count = 0
        for image in images:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_image)
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            for encoding in face_encodings:
                known_face_encodings.append(encoding)
                known_face_names.append(name)
                trained_count += 1
        
        save_encodings()
        
        return jsonify({
            'success': True,
            'message': f'Training thành công {trained_count} khuôn mặt cho {name}',
            'total_faces': len(known_face_names)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 4. Danh sách ảnh training
@app.route('/api/list-training-images', methods=['GET'])
def list_training_images():
    try:
        name = request.args.get('name', None)
        
        images = []
        for filename in os.listdir(UPLOAD_FOLDER):
            if name is None or filename.startswith(name):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                stat = os.stat(filepath)
                images.append({
                    'filename': filename,
                    'path': filepath,
                    'size': stat.st_size,
                    'created': datetime.fromtimestamp(stat.st_ctime).isoformat()
                })
        
        return jsonify({
            'success': True,
            'images': images,
            'count': len(images)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 5. Xóa ảnh
@app.route('/api/delete-image', methods=['DELETE'])
def delete_image():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Thiếu tên file'}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({
                'success': True,
                'message': 'Xóa ảnh thành công'
            })
        else:
            return jsonify({'error': 'Không tìm thấy file'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 6. Sinh embedding
@app.route('/api/generate-embedding', methods=['POST'])
def generate_embedding():
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'Thiếu ảnh'}), 400
        
        image = decode_base64_image(image_data)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        if not face_encodings:
            return jsonify({'error': 'Không phát hiện khuôn mặt'}), 404
        
        embeddings = [encoding.tolist() for encoding in face_encodings]
        
        return jsonify({
            'success': True,
            'embeddings': embeddings,
            'face_count': len(embeddings),
            'face_locations': face_locations
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 7. Kiểm tra chất lượng ảnh
@app.route('/api/check-image-quality', methods=['POST'])
def check_image_quality():
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'Thiếu ảnh'}), 400
        
        image = decode_base64_image(image_data)
        
        # Kiểm tra độ phân giải
        height, width = image.shape[:2]
        
        # Kiểm tra độ sáng
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        
        # Kiểm tra độ nét
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Phát hiện khuôn mặt
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        # Kiểm tra trùng lặp
        is_duplicate = False
        duplicate_name = None
        if face_encodings:
            for encoding in face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, encoding, tolerance=0.6)
                if True in matches:
                    is_duplicate = True
                    first_match_index = matches.index(True)
                    duplicate_name = known_face_names[first_match_index]
                    break
        
        quality_score = 0
        issues = []
        
        if width < 640 or height < 480:
            issues.append('Độ phân giải thấp (khuyến nghị >= 640x480)')
        else:
            quality_score += 25
        
        if brightness < 50:
            issues.append('Ảnh quá tối')
        elif brightness > 200:
            issues.append('Ảnh quá sáng')
        else:
            quality_score += 25
        
        if laplacian_var < 100:
            issues.append('Ảnh bị mờ')
        else:
            quality_score += 25
        
        if not face_locations:
            issues.append('Không phát hiện khuôn mặt')
        elif len(face_locations) > 1:
            issues.append('Phát hiện nhiều hơn 1 khuôn mặt')
        else:
            quality_score += 25
        
        return jsonify({
            'success': True,
            'quality_score': quality_score,
            'resolution': f'{width}x{height}',
            'brightness': round(brightness, 2),
            'sharpness': round(laplacian_var, 2),
            'face_count': len(face_locations),
            'is_duplicate': is_duplicate,
            'duplicate_name': duplicate_name,
            'issues': issues,
            'status': 'good' if quality_score >= 75 else 'acceptable' if quality_score >= 50 else 'poor'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 8. Danh sách người đã train
@app.route('/api/list-trained-people', methods=['GET'])
def list_trained_people():
    try:
        unique_names = list(set(known_face_names))
        people = []
        
        for name in unique_names:
            count = known_face_names.count(name)
            people.append({
                'name': name,
                'face_count': count
            })
        
        return jsonify({
            'success': True,
            'people': people,
            'total_people': len(people),
            'total_faces': len(known_face_names)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 9. Xóa người
@app.route('/api/delete-person', methods=['DELETE'])
def delete_person():
    try:
        global known_face_encodings, known_face_names
        
        data = request.get_json()
        name = data.get('name')
        
        if not name:
            return jsonify({'error': 'Thiếu tên'}), 400
        
        # Xóa encodings
        indices_to_remove = [i for i, n in enumerate(known_face_names) if n == name]
        
        for index in sorted(indices_to_remove, reverse=True):
            del known_face_encodings[index]
            del known_face_names[index]
        
        save_encodings()
        
        # Xóa ảnh
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.startswith(name):
                os.remove(os.path.join(UPLOAD_FOLDER, filename))
        
        return jsonify({
            'success': True,
            'message': f'Đã xóa {len(indices_to_remove)} khuôn mặt của {name}',
            'removed_count': len(indices_to_remove)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 10. NHẬN DIỆN KHUÔN MẶT (MỚI)
@app.route('/api/recognize-face', methods=['POST'])
def recognize_face():
    try:
        data = request.get_json()
        image_data = data.get('image')
        tolerance = data.get('tolerance', 0.6)  # Ngưỡng so khớp
        
        if not image_data:
            return jsonify({'error': 'Thiếu ảnh'}), 400
        
        if not known_face_encodings:
            return jsonify({
                'success': False,
                'message': 'Chưa có dữ liệu training',
                'recognized_faces': []
            }), 200
        
        image = decode_base64_image(image_data)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Phát hiện khuôn mặt
        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        recognized_faces = []
        
        for i, (face_encoding, face_location) in enumerate(zip(face_encodings, face_locations)):
            # So khớp với database
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=tolerance)
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            
            name = "Unknown"
            confidence = 0
            
            if True in matches:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]
                    confidence = round((1 - face_distances[best_match_index]) * 100, 2)
            
            top, right, bottom, left = face_location
            
            recognized_faces.append({
                'id': i + 1,
                'name': name,
                'confidence': confidence,
                'location': {
                    'top': int(top),
                    'right': int(right),
                    'bottom': int(bottom),
                    'left': int(left)
                }
            })
        
        return jsonify({
            'success': True,
            'recognized_faces': recognized_faces,
            'total_detected': len(face_locations)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("="*60)
    print("🚀 Face Training & Recognition API đang chạy...")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"📊 Đã load {len(known_face_names)} khuôn mặt")
    print(f"👥 Số người: {len(set(known_face_names))}")
    print("="*60)
    app.run(debug=True, host='0.0.0.0', port=5000)