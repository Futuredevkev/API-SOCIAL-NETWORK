import face_recognition
import numpy as np
import os
import sys
import json

class FaceRecognition:
    def __init__(self, storage_path='faces'):
        self.storage_path = storage_path
        os.makedirs(self.storage_path, exist_ok=True)

    def save_face_encoding(self, face_image_path):
        """Guarda el encoding de la cara."""
        image = face_recognition.load_image_file(face_image_path)
        face_encodings = face_recognition.face_encodings(image)

        if not face_encodings:
            raise ValueError("No face found in the image.")

        face_encoding = face_encodings[0]
        return face_encoding.tolist()  

    def verify_face(self, face_image_path, stored_encoding):
        """Verifica si la cara coincide con el encoding almacenado."""
        image = face_recognition.load_image_file(face_image_path)
        face_encodings = face_recognition.face_encodings(image)

        if not face_encodings:
            raise ValueError("No face found in the image.")

        face_encoding = face_encodings[0]
        match = face_recognition.compare_faces([np.array(stored_encoding)], face_encoding)[0]
        return match


if __name__ == "__main__":
    operation = sys.argv[1]
    face_image_path = sys.argv[2]

    recognizer = FaceRecognition()

    try:
        if operation == "save_face":
            encoding = recognizer.save_face_encoding(face_image_path)
            print(json.dumps(encoding))  
        elif operation == "verify_face":
            stored_encoding = json.loads(sys.argv[3])  
            result = recognizer.verify_face(face_image_path, stored_encoding)
            print(json.dumps({"match": result})) 
        else:
            raise ValueError("Unsupported operation")
    except Exception as e:
        print(str(e))
        sys.exit(1)
