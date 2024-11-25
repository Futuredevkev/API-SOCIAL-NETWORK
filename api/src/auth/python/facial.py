import face_recognition
import numpy as np
import os
import sys
import json
from PIL import Image

class FaceRecognition:
    def __init__(self, storage_path='faces'):
        print('Inicializando FaceRecognition con storage_path:', storage_path)
        self.storage_path = storage_path
        os.makedirs(self.storage_path, exist_ok=True)

    def convert_image_to_rgb(self, image_path):
        print('Convirtiendo imagen a RGB:', image_path)
        try:
            image = Image.open(image_path)
            image_rgb = image.convert('RGB')
            temp_path = os.path.join(self.storage_path, 'temp_rgb.jpg')
            image_rgb.save(temp_path)
            print('Imagen convertida a RGB y guardada en:', temp_path)
            return temp_path
        except Exception as e:
            print('Error al convertir la imagen a RGB:', e)
            raise ValueError(f"Error al convertir la imagen a RGB: {e}")

    def save_face_encoding(self, face_image_path):
        print('Generando encoding facial para la imagen:', face_image_path)
        try:
            rgb_image_path = self.convert_image_to_rgb(face_image_path)
            image = face_recognition.load_image_file(rgb_image_path)
            face_encodings = face_recognition.face_encodings(image)
            if not face_encodings:
                print('No se detectó ninguna cara en la imagen.')
                raise ValueError("No se detectó ninguna cara en la imagen.")
            face_encoding = face_encodings[0]
            print('Encoding facial generado con éxito')
            return face_encoding.tolist()
        except Exception as e:
            print('Error al generar el encoding facial:', e)
            raise ValueError(f"Error al guardar el encoding facial: {e}")

if __name__ == "__main__":
    print('Ejecutando script facial.py con argumentos:', sys.argv)
    operation = sys.argv[1]
    face_image_path = sys.argv[2]
    recognizer = FaceRecognition()

    try:
        if operation == "save_face":
            encoding = recognizer.save_face_encoding(face_image_path)
            print('Resultado del encoding:', encoding)
            print(json.dumps(encoding))
        else:
            print('Operación no soportada:', operation)
            raise ValueError("Operación no soportada. Use 'save_face'.")
    except Exception as e:
        print('Error en el script facial.py:', e)
        sys.exit(1)
