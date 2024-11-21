# PROXIMA FUNCIONALIDAD


3-usar ws-message para enviar notificaciones para quien te comente la publicacion, quien comente la misma publicacion que vos, quien te mande mensaje, y quien te de necesito, o like, o cualquiera de ellos 


4- poner reconocimiento facial con python para entrar a la app y confirmar q eres tu

5- Lista de intercambiadores usuarios favoritos 

6- fijarse devolver los datos con cuidado y correctamente 








-------------------------------------------------------------------


Funcionalidades Requeridas para la App
Descripción General
La aplicación debe permitir a los usuarios interactuar mediante la creación, gestión y visualización de publicaciones relacionadas con el intercambio o regalo de objetos. La funcionalidad debe estar centrada en la proximidad geográfica del usuario, comunicación en tiempo real, y categorización de publicaciones.

Funcionalidades Clave
Publicaciones
Creación de Publicaciones

Los usuarios podrán crear publicaciones.
Deben poder subir múltiples imágenes y videos en una sola publicación.
Cada publicación debe incluir una categoría predefinida desde un enum.
Opcionalmente, se puede añadir una etiqueta de urgencia para destacar publicaciones urgentes.
Edición de Publicaciones

Los usuarios podrán editar sus publicaciones después de crearlas.
Se debe permitir la edición de imágenes y videos.
Eliminación de Publicaciones

Los usuarios podrán eliminar sus publicaciones.
Las publicaciones eliminadas deberían ser marcadas como eliminadas en lugar de ser completamente borradas para mantener el historial.
Comentarios y Reacciones
Comentarios

Los usuarios podrán agregar comentarios a las publicaciones.
Los comentarios pueden ser editados y eliminados.
Los usuarios podrán responder a comentarios, y las respuestas también podrán ser editadas o eliminadas.
Añadir una opción para reportar comentarios inapropiados.
Reacciones

Los usuarios podrán reaccionar a las publicaciones con dos tipos de reacciones:
"Me Interesa": Representado por una carita con dinero.
"Hablame": Representado por un emoji de alguien hablando.
Considerar agregar una reacción adicional, como "Favorito" para que los usuarios puedan marcar publicaciones que les gustan especialmente.
Categorías de Publicaciones
Las publicaciones deben estar clasificadas bajo categorías predefinidas mediante un enum.
Permitir la búsqueda filtrada por categoría para facilitar la navegación.
Funcionalidades de Comunicación
Chat en Tiempo Real

Los usuarios podrán intercambiar mensajes en tiempo real.
Implementar notificaciones para nuevos mensajes y actualizaciones en chats.
Videollamadas y Llamadas

Los usuarios podrán realizar videollamadas y llamadas de voz.
Añadir soporte para videollamadas grupales.
Calificación y Confirmación
Calificación en el Chat

Tras completar un intercambio o regalo a través del chat, los usuarios podrán calificar al otro usuario con un sistema de estrellas (1 a 5 estrellas).
La calificación debe estar asociada a una confirmación de que el objeto fue intercambiado o entregado.
Confirmación de Intercambio/Regalo

Incluir una sección en el chat donde los usuarios puedan indicar si el objeto fue intercambiado o entregado.
Añadir una función de confirmación que permita a ambas partes verificar y cerrar el intercambio o regalo.
Perfiles de Usuario
Cada usuario debe tener su perfil, que incluirá información básica, interacciones dentro de la app, y una sección de publicaciones destacadas.
Comunidades
Habrá comunidades específicas para objetos o temas determinados.
Los usuarios podrán unirse y participar en estas comunidades.
Implementar una sección de anuncios de la comunidad para noticias y actualizaciones importantes.
Sistema de Suscripción
Los usuarios tendrán un sistema de suscripción que les permitirá hacer más de 3 publicaciones al día.
Penalización por Venta de Objetos: La app penalizará la venta de objetos. Implementar un sistema de penalización que restringe la capacidad de publicar para aquellos que intenten vender objetos en lugar de intercambiarlos o regalarlos.
Calificación de Usuario
Cada usuario tendrá una calificación basada en su desempeño como intercambiador o regalador.
Añadir un sistema de reseñas donde los usuarios puedan dejar comentarios sobre otros usuarios después de una transacción.
Búsqueda y Preferencias
Feed

Los usuarios podrán buscar personas, objetos y comunidades dentro del feed.
Implementar un sistema de recomendaciones personalizadas basado en el historial de búsqueda y preferencias.
Lista de Usuarios con Preferencias

Habrá una lista de usuarios basada en preferencias específicas del usuario.
Permitir la creación de listas de usuarios favoritos o contactos frecuentes.
Seguridad y Privacidad
Implementar un sistema de verificación de identidad para usuarios que deseen acceder a funciones avanzadas.
Asegurar que todas las comunicaciones sean encriptadas para proteger la privacidad del usuario.
Notificaciones
Enviar notificaciones para actividades relevantes como mensajes, actualizaciones en publicaciones, y eventos en comunidades.

# POR ULTIMO VERIFICACION DE TELEFONO
