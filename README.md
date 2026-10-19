# Almacenamiento de imágenes con Node.js y Express

## Registro de productos con imágenes

**Materia:** Diseño Web Dinámico
**Tema:** Almacenamiento de imágenes en un backend
**Tecnologías:** Node.js, Express, SQLite3, Multer y Postman

---

## 1. Presentación del proyecto

Este proyecto se desarrolla en el marco de la materia **Diseño Web Dinámico**.

El objetivo de la clase es comprender cómo funciona el **almacenamiento de imágenes en una aplicación web dinámica**: cómo un cliente (por ejemplo, Postman o un formulario web) envía un archivo a un servidor, cómo el servidor lo guarda en su disco duro y cómo queda asociado a los datos de un producto en una base de datos.

Para estudiarlo, se construye un **backend de registro de productos** en el que cada producto tiene un nombre, un precio, un stock, una descripción y **una imagen**. El proyecto permite responder preguntas como:

- ¿Dónde se guarda físicamente la imagen? (en la carpeta `uploads/` del servidor).
- ¿Qué se guarda en la base de datos? (solamente el **nombre del archivo**, por ejemplo `1718000000000-abc123.png`).
- ¿Cómo llega el archivo desde el cliente hasta el servidor? (mediante una solicitud HTTP con `multipart/form-data`, procesada por **Multer**).
- ¿Cómo puede el navegador ver la imagen después? (mediante una ruta estática de Express: `/uploads/...`).

> **Idea central:** la base de datos no guarda la imagen "adentro", guarda un texto (el nombre del archivo). La imagen en sí vive como archivo dentro del servidor.

---

## 2. Objetivos de aprendizaje

Al finalizar la clase, el estudiante será capaz de:

1. **Crear un backend con Node.js y Express**, con punto de entrada, middlewares y escucha de puerto.
2. **Organizar el proyecto por carpetas**: `Routes/` (las URLs), `Controller/` (la lógica) y `Database/` (la conexión a SQLite).
3. **Utilizar Multer para recibir archivos** dentro de una solicitud HTTP (`multer.diskStorage()`, `single('Imagen')`, `req.file`).
4. **Guardar las imágenes en una carpeta del servidor** (`uploads/`) con un nombre único.
5. **Registrar los datos del producto y el nombre de su imagen en SQLite** mediante una consulta `INSERT`.
6. **Probar solicitudes HTTP con Postman**, usando `Body → form-data` para enviar campos de texto y un archivo en la misma petición.

---

## 3. Tecnologías utilizadas

| Tecnología / dependencia | Función en el proyecto |
|---|---|
| **Node.js** | Entorno de ejecución de JavaScript del lado del servidor. Permite usar `fs`, `path`, etc. |
| **Express** (`express@^5.3.0`) | Framework web: crea el servidor, define rutas, middlewares y sirve archivos estáticos (`express.static()`). |
| **SQLite3** (`sqlite3@^6.0.1`) | Base de datos en un solo archivo (`Productos.db`). Guarda los productos y el nombre de su imagen. |
| **Multer** (`multer@^2.4.0`) | Middleware de Express que procesa peticiones `multipart/form-data` y **recibe archivos**, dejándolos en `req.file`. |
| **cors** (`cors@^2.8.6`) | Middleware que habilita peticiones desde otros orígenes (por ejemplo, desde un frontend en otro puerto). |
| **dotenv** (`dotenv@^18.0.8`) | Permite leer variables de un archivo `.env`. El repositorio incluye un `.env` con `PORT=3000`. |
| **nodemon** (`nodemon@^3.1.14`) | Reinicia el servidor automáticamente al guardar cambios. Se usa en el script `dev`. |
| **Postman** | Cliente HTTP para probar el endpoint: enviar el producto + la imagen y ver la respuesta JSON. |

> **Nota sobre el puerto:** en `Index.js` se define `const PORT = process.env.PORT || 3001`. Como el archivo `Index.js` **no ejecuta** `require('dotenv').config()`, la variable `PORT` del archivo `.env` no se carga y el servidor inicia por defecto en el **puerto 3001**.

---

## 4. Estructura del proyecto

Estructura real del repositorio (sin contar `node_modules`):

```
Carga de Imagenes/
└── BackEnd/
    ├── src/
    │   ├── Controller/
    │   │   └── Registro.Controller.js   ← lógica de registro del producto
    │   ├── Database/
    │   │   ├── db.js                    ← conexión a SQLite + creación de tabla
    │   │   └── Productos.db             ← archivo de la base de datos
    │   ├── Routes/
    │   │   └── Registro.Route.js        ← define las rutas de la API
    │   └── uploads/                     ← carpeta destino de imágenes (vacía al inicio)
    ├── Index.js                         ← punto de entrada: crea y levanta el servidor
    ├── package.json                     ← dependencias y scripts
    ├── package-lock.json
    ├── .env                             ← PORT=3000
    └── .gitignore                       ← ignora node_modules
```

### Responsabilidad de cada archivo

| Archivo | Responsabilidad |
|---|---|
| `BackEnd/Index.js` | Inicializa Express, aplica middlewares (`express.json()`, `cors()`), sirve la carpeta `uploads` como ruta estática, monta las rutas en `/api/Productos` y escucha en el puerto. |
| `src/Routes/Registro.Route.js` | Crea un `express.Router()`, importa el controlador `RegistrarProducto` y —cuando esté completo— definirá el endpoint `POST /RegistrarProducto`. |
| `src/Controller/Registro.Controller.js` | Contiene `RegistrarProducto`: valida los campos de `req.body`, ejecuta el `INSERT` en SQLite y responde con un JSON. |
| `src/Database/db.js` | Abre (o crea) `Productos.db`, crea la tabla `Productos` con `CREATE TABLE IF NOT EXISTS` y exporta la conexión. |
| `src/Database/Productos.db` | Archivo binario de SQLite con la tabla `Productos`. |
| `src/uploads/` | Carpeta donde deberían guardarse las imágenes recibidas. |
| `package.json` | Declara las dependencias y los scripts `start` y `dev`. |

> **Diferencia con la estructura orientativa:** en este repositorio la carpeta `uploads/` está dentro de `src/` (`BackEnd/src/uploads/`), mientras que `Index.js` publica `path.resolve(__dirname, 'uploads')`, es decir, `BackEnd/uploads/`. Esta diferencia se explica en la sección de [errores frecuentes](#11-errores-frecuentes).

---

## 5. Instalación y ejecución

### Requisitos previos

- Tener **Node.js** instalado (versión 18 o superior recomendada). Se verifica con:
  ```bash
  node -v
  npm -v
  ```
- Tener **Postman** instalado para probar el endpoint.
- Un cliente para ver la base de datos SQLite (por ejemplo, la extensión *SQLite Viewer* de VS Code, o `sqlite3` en consola).

### Instalación de dependencias

Desde la carpeta del backend:

```bash
cd BackEnd
npm install
```

Esto instala todo lo declarado en `package.json`: `express`, `cors`, `dotenv`, `multer`, `sqlite3` y `nodemon`.

### Scripts disponibles (definidos en `package.json`)

| Script | Comando | Qué hace |
|---|---|---|
| `start` | `npm start` | Ejecuta `node Index.js` una sola vez. |
| `dev` | `npm run dev` | Ejecuta `nodemon Index.js`: reinicia el servidor al detectar cambios. |
| `test` | `npm test` | No está implementado (devuelve un mensaje de error, es el default de npm). |

### Inicio del servidor

```bash
npm run dev
```

Salida esperada en la consola:

```
Base de Datos creada Correctamente ✅
Tabla Productos creada Correctamente ✅
Servidor corriendo en el puerto http:localhost:3001
```

- **Puerto por defecto:** `3001` (definido en `Index.js` con `process.env.PORT || 3001`).

---

## 6. Funcionamiento del almacenamiento de imágenes

Este es el recorrido completo de una imagen, desde el cliente hasta la base de datos:

1. **El cliente envía los datos del producto y un archivo de imagen** en una sola solicitud HTTP `POST`.
2. **En Postman se selecciona `Body → form-data`**: los campos de texto (`Nombre`, `Precio`, `Stock`, `Descripcion`) se envían como texto y el campo `Imagen` se envía como tipo **File**. Postman agrega automáticamente el encabezado `Content-Type: multipart/form-data`.
3. **Multer recibe el archivo.** Sin Multer, Express no puede leer archivos: solo entiende JSON y texto.
4. **`multer.diskStorage()`** configura dos cosas:
   - `destination`: la carpeta donde se guardará el archivo (por ejemplo, `uploads/`).
   - `filename`: el nombre con el que se guardará (comúnmente un timestamp + aleatorio + la extensión original).
5. **`single('Imagen')`** indica que la solicitud trae **un único archivo**, y que ese archivo viene en el campo llamado `Imagen`. El nombre debe coincidir exactamente con el campo de Postman.
6. **El controlador obtiene los datos**:
   - Los campos de texto: desde `req.body` → `const { Nombre, Precio, Stock, Descripcion } = req.body;`
   - El archivo: desde `req.file` → `req.file.filename` contiene, por ejemplo, `1718000000000-a1b2c3.png`.
7. **SQLite almacena el nombre del archivo** junto con los datos del producto, en la columna `Imagen` de la tabla `Productos`.
8. **Express sirve las imágenes** mediante una ruta estática configurada en `Index.js`:
   ```js
   App.use('/uploads', Express.static(path.resolve(__dirname, 'uploads')));
   ```
   De modo que `http://localhost:3001/uploads/<nombre-del-archivo>` devuelve la imagen en el navegador.

### Archivo físico vs. nombre en la base de datos

| Dónde | Qué se guarda | Ejemplo |
|---|---|---|
| Carpeta `uploads/` del servidor | El **archivo de imagen completo** (bytes) | `uploads/1718000000000-a1b2c3.png` |
| Base de datos, tabla `Productos`, columna `Imagen` | Solo el **nombre del archivo** (texto) | `1718000000000-a1b2c3.png` |

¿Por qué no guardar la imagen dentro de la base de datos? Porque las bases de datos están pensadas para datos estructurados y consultables; guardar binarios las hace lentas y pesadas. Lo correcto es: **archivo físico en el disco + referencia (nombre) en la base de datos**.

---

## 7. Explicación del código

### 7.1 `Index.js` — punto de entrada del servidor

```js
const Express = require('express')
const cors = require('cors');
const path = require('path');

const App = Express();

const PORT = process.env.PORT || 3001;

App.use(Express.json());
App.use(cors());
```

- Se importa e inicializa Express.
- `PORT` toma la variable de entorno o, si no existe, usa `3001`.
- `Express.json()` permite recibir JSON en el cuerpo de las peticiones.
- `cors()` habilita peticiones de otros orígenes.

```js
const RegistroRoutes = require('./src/Routes/Registro.Route');

App.use(
    '/uploads',
    Express.static(path.resolve(__dirname, 'uploads'))
);

App.use('/api/Productos', RegistroRoutes);
```

- **`Express.static()`** es la clave para *ver* las imágenes desde el navegador: publica una carpeta del disco bajo una URL. `path.resolve(__dirname, 'uploads')` construye la ruta absoluta a la carpeta `uploads` que está junto a `Index.js`.
- **`App.use('/api/Productos', RegistroRoutes)`** monta el router dentro del prefijo `/api/Productos`. Todas las rutas definidas en `Registro.Route.js` serán accesibles a partir de esa URL.

```js
App.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http:localhost:${PORT}`)
})
```

Arranca el servidor y avisa en consola.

### 7.2 `src/Database/db.js` — conexión y creación de la tabla

```js
const Ubicacion = require('path');
const SQLite3 = require('sqlite3');

const Database = Ubicacion.resolve(__dirname, './Productos.db');

const ConexionBD = new SQLite3.Database(Database, (error) => { ... });
```

- `path.resolve(__dirname, './Productos.db')` evita rutas relativas: la base de datos se crea **siempre** junto al archivo `db.js`, dentro de `src/Database/`.

```js
ConexionBD.exec(
    `CREATE TABLE IF NOT EXISTS Productos(
        IDProducto INTEGER PRIMARY KEY AUTOINCREMENT,
        Nombre TEXT NOT NULL,
        Precio FLOAT NOT NULL,
        Stock INTEGER NOT NULL,
        Descripcion TEXT NOT NULL,
        Imagen TEXT
    )`, ...
);
```

- Crea la tabla solo si no existe (`IF NOT EXISTS`).
- **`Imagen TEXT`** es la columna que guardará el *nombre* del archivo, no la imagen.

```js
module.exports = ConexionBD;
```

- Se exporta la conexión para que el controlador la use con `ConexionBD.run(...)`.

### 7.3 `src/Routes/Registro.Route.js` — las rutas

```js
const express = require('express');
const Router = express.Router();

const { RegistrarProducto } = require('../Controller/Registro.Controller');

module.exports = Router;
```

- Se crea un router de Express y se importa la función del controlador.
- **Estado actual:** el archivo todavía **no define ninguna ruta**. Falta agregar, por ejemplo, la línea que conecte el método `POST` con el controlador:
  ```js
  // Aún no está en el repositorio: es el paso pendiente
  Router.post('/RegistrarProducto', upload.single('Imagen'), RegistrarProducto);
  ```
  Donde `upload` es la instancia de Multer configurada (ver 7.4). Hasta que esa línea exista, el endpoint `POST /api/Productos/RegistrarProducto` responderá **404 Not Found**.

### 7.4 Configuración de Multer (pendiente de implementar)

Multer está declarado en `package.json` (`"multer": "^2.4.0"`), pero **el código fuente actual no lo configura todavía**. Esta es la configuración que se debe agregar —normalmente en la ruta o en el controlador— para que el almacenamiento de imágenes funcione:

```js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    // 1) ¿Dónde se guarda el archivo?
    destination: (req, file, cb) => {
        cb(null, 'uploads/');            // carpeta destino
    },
    // 2) ¿Cómo se llama el archivo?
    filename: (req, file, cb) => {
        const sufijo = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, sufijo + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
```

Explicación de cada pieza:

- **`multer.diskStorage()`**: le dice a Multer que guarde el archivo **en el disco del servidor** (existe también memoria, pero no es lo que usamos aquí).
- **`destination`**: carpeta de destino. Recibe un callback `cb(error, destino)`.
- **`filename`**: nombre final del archivo. Se recomienda un valor único (como `Date.now()`) para que dos imágenes con el mismo nombre no se pisen, más un número aleatorio.
- **`path.extname(file.originalname)`**: extrae la extensión del archivo original (`.png`, `.jpg`, `.webp`) para conservarla. Sin esto, el navegador no sabría qué tipo de imagen está viendo.
- **`multer({ storage })`**: crea el middleware de Multer a partir de esa configuración.
- **`upload.single('Imagen')`**: middleware que procesa **un solo archivo** del campo llamado `Imagen`. El nombre `'Imagen'` debe coincidir **exactamente** con el campo enviado desde Postman.

Después de pasar por `upload.single('Imagen')`:

- `req.body` → contiene los campos de texto (`Nombre`, `Precio`, `Stock`, `Descripcion`).
- `req.file` → contiene información del archivo guardado: `req.file.filename`, `req.file.path`, `req.file.originalname`, etc.

### 7.5 `src/Controller/Registro.Controller.js` — el controlador

```js
const ConexionBD = require('../Database/db.js');
const fs = require('fs');
const path = require('path');

const RegistrarProducto = async (req, res) => {
    try {
        const { Nombre, Precio, Stock, Descripcion } = req.body;
```

- **`req.body`** reúne todos los campos de texto de la solicitud (los que Postman envía como tipo *Text* en `form-data`).

```js
        if (!Nombre || Precio === undefined || Precio === '' ||
            Stock === undefined || Stock === '' || !Descripcion) {
            return res.status(400).json({
                Mensaje: 'Debe completar todos los campos obligatorios'
            });
        }
```

- Valida que no falte ningún campo obligatorio. Si falta alguno, responde con **HTTP 400**.

```js
        const query = `INSERT INTO Productos
                (Nombre, Precio, Stock, Descripcion, Imagen)
                VALUES (?, ?, ?, ?, ?)`

        ConexionBD.run(query, [Nombre, Precio, Stock, Descripcion, Imagen],
            function (error) { ... }
        );
```

- **`ConexionBD.run()`** ejecuta una sentencia SQL que modifica datos (`INSERT`, `UPDATE`, `DELETE`).
- Los **`?`** son marcadores de posición: los valores se pasan en el arreglo, en el mismo orden, lo que evita el temido *SQL Injection*.
- **Punto pendiente del código actual:** la variable `Imagen` **no está definida** dentro de la función. Debería tomarse del archivo subido con Multer:
  ```js
  const Imagen = req.file ? req.file.filename : null;
  ```
  Tal como está, `Imagen` provoca un `ReferenceError` que el `catch` convierte en un **500 "Error interno del servidor"**.

```js
            function (error) {
                if (error) {
                    console.error('Error al Registrar Producto ⛔', error.message);
                    return res.status(500).json({
                        Mensaje: 'No se pudo registrar el producto'
                    });
                }

                return res.status(201).json({
                    Mensaje: 'Producto registrado correctamente ✅',
                    IDProducto: this.lastID
                });
            }
```

- La función se ejecuta como `function` (no como flecha) **a propósito**: así `this` hace referencia al contexto de `sqlite3` y **`this.lastID`** contiene el número de fila recién creada (el `IDProducto` autoincremental).
- **Respuesta exitosa:** HTTP **201** con el mensaje y el ID generado.

```js
module.exports = { RegistrarProducto };
```

Exporta la función para que la ruta la utilice.

---

## 8. Prueba con Postman

### Datos de la solicitud

| Dato | Valor |
|---|---|
| Método | `POST` |
| URL | `http://localhost:3001/api/Productos/RegistrarProducto` |

> **Importante:** la URL se forma por la suma de `App.use('/api/Productos', RegistroRoutes)` (en `Index.js`) + la ruta que se defina dentro de `Registro.Route.js`. En el estado actual del repositorio, el router **aún no define** el método `POST /RegistrarProducto`, por lo que Postman responderá `404 Cannot GET/POST ...` hasta que esa línea se agregue. Verificá siempre la ruta real en `src/Routes/Registro.Route.js`.

### Configuración del cuerpo

1. Abrir Postman y crear una nueva pestaña.
2. Seleccionar el método **POST** y pegar la URL.
3. Ir a **Body → form-data**.
4. En la columna **Key**, escribir los nombres de los campos; en **Value**, los datos. Al escribir `Imagen`, hay que cambiar el tipo de *Text* a **File** en el desplegable de la derecha, y luego elegir una imagen del equipo.

| Campo | Tipo | Ejemplo |
|---|---|---|
| `Nombre` | Text | Mouse inalámbrico |
| `Precio` | Text | 18500 |
| `Stock` | Text | 20 |
| `Descripcion` | Text | Mouse inalámbrico USB |
| `Imagen` | File | Seleccionar una imagen local |

**Aclaraciones clave:**

- El campo `Imagen` debe coincidir **exactamente** con `single('Imagen')` del middleware de Multer. Si en Postman se llama `imagen`, `Foto` o `image`, Multer no lo reconoce y `req.file` queda en `undefined`.
- Postman genera automáticamente el encabezado `Content-Type: multipart/form-data; boundary=----...`. **No lo escribas a mano**: si lo hacés, el *boundary* se pierde y el servidor no puede separar los campos.
- Los campos de texto también deben enviarse desde `form-data` (no desde otra pestaña), para que viajen en la misma solicitud que el archivo.

### Respuesta exitosa

Basada en el `res.status(201)` del controlador:

```json
{
    "Mensaje": "Producto registrado correctamente ✅",
    "IDProducto": 1
}
```

`IDProducto` corresponde a `this.lastID`: el identificador autogenerado por SQLite para esa fila.

### Respuestas de error posibles

| Código | Mensaje | Causa probable |
|---|---|---|
| `400` | `Debe completar todos los campos obligatorios` | Faltan `Nombre` o `Descripcion`, o `Precio`/`Stock` están vacíos. |
| `404` | `Cannot POST /api/Productos/RegistrarProducto` | La ruta no está definida en `Registro.Route.js`. |
| `500` | `No se pudo registrar el producto` | Error en la consulta SQL (por ejemplo, tabla inexistente). |
| `500` | `Error interno del servidor` | Excepción en el controlador (por ejemplo, la variable `Imagen` sin definir). |

---

## 9. Verificación del resultado

Una vez enviada la solicitud, comprobar los cuatro puntos siguientes:

1. **Producto registrado en SQLite.**
   Abrir `BackEnd/src/Database/Productos.db` con un visor de SQLite y ejecutar:
   ```sql
   SELECT * FROM Productos;
   ```
   Debe aparecer la fila nueva con el `IDProducto`, `Nombre`, `Precio`, `Stock` y `Descripcion` enviados.

2. **El campo `Imagen` contiene el nombre del archivo.**
   En esa misma fila, la columna `Imagen` debe mostrar un valor como `1718000000000-a1b2c3.png`. Ese texto es **todo** lo que la base de datos guarda de la imagen.

3. **El archivo existe en la carpeta de uploads.**
   Revisar en el explorador de archivos que dentro de la carpeta `uploads` (la que usa `Index.js`: `BackEnd/uploads/`) aparezca un archivo con ese mismo nombre.

4. **La imagen se puede ver en el navegador.**
   Abrir:
   ```
   http://localhost:3001/uploads/<nombre-del-archivo>
   ```
   Gracias a `Express.static`, el servidor devuelve el archivo y el navegador lo muestra. Si la URL da 404, revisar que la carpeta publicada por `Index.js` sea efectivamente donde Multer guardó el archivo (ver sección 11).

---

## 10. Diferencia entre JSON y form-data

| | `raw → JSON` | `form-data` |
|---|---|---|
| Contenido | Solo datos estructurados de texto | Campos de texto **y archivos** en la misma solicitud |
| Cabecera | `Content-Type: application/json` | `multipart/form-data; boundary=...` |
| ¿Envía archivos? | **No** | **Sí** |
| Cómo lo lee Express | `Express.json()` → `req.body` con objetos | Multer → `req.body` (texto) + `req.file` (archivo) |

### ¿Por qué no basta con enviar la URL de la imagen en un JSON?

Porque **no es lo mismo adjuntar un archivo que describirlo**:

```json
{ "Nombre": "Mouse", "Imagen": "mouse.png" }
```

Eso solo envía un *texto* llamado `mouse.png`. El servidor no recibe ningún archivo: no hay nada que guardar en `uploads/`, y `req.file` será `undefined`. El controlador actual espera justamente un archivo real:

```js
const Imagen = req.file ? req.file.filename : null;   // req.file viene de Multer
```

Para que `req.file` tenga contenido, la solicitud debe ser `multipart/form-data` con el archivo adjunto en el campo `Imagen`, y debe pasar por el middleware `single('Imagen')`. Por eso en Postman se usa **Body → form-data** y no **raw → JSON**.

> Nota: enviar una URL completa (`https://.../mouse.png`) dentro del JSON es otra estrategia válida (guardar en la BD una URL externa), pero **no es el enfoque de esta clase**, que consiste en almacenar el archivo físicamente en el servidor.

---

## 11. Errores frecuentes

| Error / síntoma | Causa | Solución |
|---|---|---|
| `Cannot find module './src/Routes/Registro.Route'` | Ruta mal escrita o carpeta mal nombrada al hacer el `require`. | Verificar que la ruta sea exactamente la del archivo real y que coincidan mayúsculas/minúsculas (Windows y Linux difieren). |
| `Cannot find module '../Controller/Registro.Controller'` | El `require` no apunta al archivo real. | El controlador está en `src/Controller/Registro.Controller.js` (carpeta `Controller`, en singular). |
| Error confundiendo `Controller` y `Controllers` | El nombre de la carpeta en el `require` no coincide con la carpeta física. | Este repositorio usa **`Controller`** (singular). Si se renombra a `Controllers`, hay que actualizar **todos** los `require` que apuntan allí. |
| `404 Cannot POST /api/Productos/RegistrarProducto` | `Registro.Route.js` exporta el router pero no define la ruta. | Agregar la definición de la ruta `POST /RegistrarProducto` (con `upload.single('Imagen')` y `RegistrarProducto`) antes de probar en Postman. |
| `ENOENT: no such file or directory ... uploads` | La carpeta `uploads` no existe en la ruta que publica `Index.js`. | `Index.js` publica `BackEnd/uploads`, pero en el repositorio la carpeta existe en `BackEnd/src/uploads`. Crear `BackEnd/uploads` **o** ajustar `destination` de Multer y `express.static` para que apunten al mismo lugar. |
| El campo `Imagen` llega como `null` o `req.file` es `undefined` | El archivo no fue enviado, o el nombre del campo no coincide con `single('Imagen')`. | En Postman: tipo **File** (no Text) y el key debe ser exactamente `Imagen`. También verificar que la ruta tenga el middleware `upload.single('Imagen')`. |
| Error al enviar el archivo desde Postman | Se envió en `raw → JSON`, o se escribió a mano `Content-Type: multipart/form-data` sin *boundary*. | Usar **Body → form-data** y dejar que Postman genere la cabecera automáticamente. |
| La imagen no se visualiza (404 en `/uploads/...`) | La carpeta publicada por `express.static` no es la carpeta donde se guardó el archivo, o el nombre del archivo no coincide. | Comparar `path.resolve(__dirname, 'uploads')` de `Index.js` con el `destination` de Multer y con el valor guardado en la columna `Imagen`. Los tres deben referirse al mismo archivo. |
| `Error interno del servidor` (500) al registrar | En `RegistrarProducto` se usa la variable `Imagen`, que nunca se asignó. | Obtener el nombre del archivo con `req.file.filename` antes del `INSERT`. |
| Fallos de conexión con SQLite / `SQLITE_CANTOPEN` | La ruta de `Productos.db` no existe o el archivo está bloqueado. | La ruta se resuelve con `path.resolve(__dirname, './Productos.db')` dentro de `src/Database/`; verificar que esa carpeta exista y tenga permisos de escritura. |
| `Tabla Productos no existe` | `db.js` no llegó a ejecutar el `CREATE TABLE` (la conexión falló). | Revisar en consola los mensajes de `db.js`: `Base de Datos creada Correctamente ✅` y `Tabla Productos creada Correctamente ✅`. |

---

## 12. Actividad propuesta

1. **Registrar tres productos diferentes** desde Postman, usando `POST → Body → form-data` en cada caso (por ejemplo: Mouse inalámbrico, Teclado mecánico, Auriculares USB).
2. **Asociar una imagen a cada producto**, asegurándose de que el campo se llame `Imagen` y sea de tipo *File*.
3. **Comprobar los registros en SQLite**, abriendo `src/Database/Productos.db` y ejecutando:
   ```sql
   SELECT IDProducto, Nombre, Imagen FROM Productos;
   ```
4. **Identificar el nombre de cada archivo almacenado** en la columna `Imagen` y verificar que esos tres archivos existen físicamente en la carpeta `uploads/`.
5. **Explicar el recorrido completo de la imagen**, con sus propias palabras, desde Postman hasta el servidor:
   - ¿En qué pestaña de Postman se adjuntó?
   - ¿Qué middleware la procesó?
   - ¿Dónde se guardó y con qué nombre?
   - ¿Qué quedó guardado en la base de datos?
   - ¿Qué URL usarías en el navegador para verla?

**Criterios de evaluación:** los tres productos registrados, tres archivos presentes en `uploads/`, tres nombres coincidentes en la base de datos y una explicación correcta del flujo cliente → Multer → disco + SQLite.

---

## 13. Conclusión

Este proyecto muestra por qué es importante **separar los datos de un producto del archivo de imagen**: la base de datos guarda información consultable (nombre, precio, stock, descripción y el *nombre* del archivo), mientras que la imagen vive como archivo físico en la carpeta `uploads/`. Esa separación mantiene la base de datos liviana y el disco organizado.

En el proceso intervienen tres piezas con roles claros:

- **Multer** recibe el archivo de la solicitud `multipart/form-data`, lo guarda en disco con un nombre único y lo entrega al controlador en `req.file`.
- **Express** organiza las rutas, ejecuta los middlewares y publica `uploads/` mediante `express.static()` para que las imágenes sean visibles desde el navegador.
- **SQLite** persiste los datos del producto junto con el nombre del archivo, permitiendo relacionar cada registro con su imagen.

Comprender este flujo es la base para trabajar después con formularios reales de una web dinámica, donde el navegador envía texto e imágenes en una sola petición.
