import face_recognition
import numpy as np
import os
import sys
import json
from PIL import Image
import traceback

class NumpyEcoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.integer):
            return int(obj)
        return super(NumpyEcoder, self).default(obj)

class FaceRecognition:
    def __init__(self, storage_path='faces'):
        """
        Inicializa el sistema de reconocimiento facial, creando el directorio de almacenamiento si no existe.
        """
        self.storage_path = storage_path
        os.makedirs(self.storage_path, exist_ok=True)

    def validate_image_file(self, image_path):
        """
        Valida si el archivo dado es una imagen válida.
        """
        try:
            with Image.open(image_path) as img:
                img.verify()
        except Exception as e:
            raise ValueError(f"El archivo no es una imagen válida: {e}")

    def convert_image_to_rgb(self, image_path):
        """
        Convierte una imagen a formato RGB y guarda el resultado en un archivo temporal.
        """
        try:
            with Image.open(image_path) as image:
                if image.mode == 'RGBA':
                    image_rgb = image.convert('RGB')
                if image.mode != 'RGB':
                    image_rgb = image.convert('RGB')
                temp_path = os.path.join(self.storage_path, 'temp_rgb.jpg')
                image_rgb.save(temp_path, 'JPEG', quality=95, optimize=True)
                return temp_path
        except Exception as e:
            raise ValueError(f"Error al convertir la imagen a RGB: {e}")

    def save_face_encoding(self, face_image_path):
        """
        Genera y guarda el encoding facial de una imagen dada.
        """
        try:
            # Validar y convertir la imagen
            self.validate_image_file(face_image_path)
            rgb_image_path = self.convert_image_to_rgb(face_image_path)

            # Cargar la imagen y generar el encoding
            image = face_recognition.load_image_file(rgb_image_path)
            face_encodings = face_recognition.face_encodings(image)

            if not face_encodings:
                raise ValueError("No se detectó ninguna cara en la imagen.")
            
            face_encoding = face_encodings[0]
            return face_encoding.tolist()
        except Exception as e:
            raise ValueError(f"Error al guardar el encoding facial: {e}")
        
    def verify_face(self, input_encoding, stored_encoding):
        """
        Verifica si el encoding facial proporcionado coincide con el almacenado.
        """
        try:     
            input_array = np.array(input_encoding)
            stored_array = np.array(stored_encoding)    
        
            distance = float(np.linalg.norm(input_array - stored_array))
            threshold = 0.6
           
            match = bool(distance <= threshold)
            
            return {
                "status": "success",
                "match": match,
                "distance": distance  
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }


def safe_json_dumps(data):
    """
    Función para asegurar que los datos son serializables a JSON.
    """
    try:
        return json.dumps(data, ensure_ascii=True)  # Usamos `ensure_ascii=True` para asegurarnos de que no haya caracteres no ASCII
    except (TypeError, ValueError) as e:
        raise ValueError(f"Error al serializar los datos a JSON: {e}")

def main():
    """
    Punto de entrada principal para ejecutar el script desde la línea de comandos.
    """
    if len(sys.argv) < 3:
        sys.exit(1)

    operation = sys.argv[1]
    face_image_path = sys.argv[2]

    recognizer = FaceRecognition()

    try:
        if operation == "save_face":
            encoding = recognizer.save_face_encoding(face_image_path)
            # Usamos la función `safe_json_dumps` para asegurar que no haya problemas al convertir a JSON
            print(safe_json_dumps({"status": "success", "encoding": encoding}))
        elif operation == "verify_face":
            input_encoding = sys.argv[2]
            stored_encoding = sys.argv[3]
            result = recognizer.verify_face(input_encoding, stored_encoding)
            print(json.dumps({"status": "success", "match": result["match"], "distance": result["distance"]}))
        else:
            raise ValueError("Operación no soportada. Use 'save_face'.")
    except Exception as e:
        # Aquí solo retornamos el error en formato JSON si algo falla
        print(safe_json_dumps({"status": "error", "message": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
