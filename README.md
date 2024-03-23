# API RESTful con Express.js y Node.js

Este proyecto consiste en la creación de una API RESTful utilizando Express.js y Node.js. La API permite realizar las siguientes operaciones:

1. **GET /api/recetas**: Obtener todas las recetas almacenadas en la base de datos.
2. **GET /api/recetas/:id**: Obtener una receta por su ID.
3. **POST /api/recetas**: Agregar una nueva receta.
4. **PUT /api/recetas/:id**: Actualizar una receta por su ID.
5. **DELETE /api/recetas/:id**: Eliminar una receta por su ID.
6. **POST /registro**: Registro de usuarios.
7. **POST /login**: Inicio sesión de usuarios.

La información relacionada con las recetas y los usuarios se almacena en bases de datos MySQL. 

## Guía de inicio rápido 🚀

Estas instrucciones te permitirán obtener una copia del ejercicio y ejecutarlo.

> **NOTA:** Necesitas tener [Node JS](https://nodejs.org/) instalado.

### Instalación y ejecución 🔧

_Ejecuta los siguientes comandos en la terminal_

1. **Clona el repositorio**:

```bash
git clone https://github.com/Adalab/modulo-4-evaluacion-final-bpw-esgab.git
```

2. Instala **dependencias locales**:

```bash
npm install
```
3. Crea un archivo **.env** en el directorio raíz y define las siguientes **variables de entorno**:

```bash
MYSQL_HOST = "tu_host_mysql"
MYSQL_USER = "tu_usuario_mysql"
MYSQL_PASS = "tu_contraseña_mysql"
MYSQL_RECIPES_DB = "nombre_de_tu_base_de_datos_de_recetas"
MYSQL_USERS_DB = "nombre_de_tu_base_de_datos_de_usuarios"
JWT_SECRET = "secreto_para_generar_tokens"
```

4. **Inicia el servidor**:

```bash
npm run dev
```
5. **Accede a la documentación de Swagger para ver los puntos finales disponibles y realizar solicitudes.**

## Feedback 📝

Siéntete libre de realizar cualquier comentario o sugerencia. Puedes ponerte en contacto conmigo a través de este [email](mailto:garbennes@gmail.com) o mediante [GitHub Issues](https://github.com/Adalab/modulo-4-evaluacion-final-bpw-esgab/issues).

## Autores ✒️

[Esther García](https://www.github.com/esgab)

