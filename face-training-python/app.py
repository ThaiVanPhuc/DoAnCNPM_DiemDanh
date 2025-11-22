from flask import Flask, request, jsonify
import face_recognition
import numpy as np

app = Flask(__name__)

# load known faces (sau này load từ database)
known_face_encodings = []
known_face_names = []

@app.route('/recognize', methods=['POST'])
def recognize():
    file = request.files['image']
    img = face_recognition.load_image_file(file)

    encodings = face_recognition.face_encodings(img)
    if len(encodings) == 0:
        return jsonify({"status": "no_face"})

    face_encoding = encodings[0]

    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
    name = "Unknown"

    if True in matches:
        index = matches.index(True)
        name = known_face_names[index]

    return jsonify({"name": name})

if __name__ == '__main__':
    app.run(port=8000)
