
const Ubicacion = require('path');
const SQLite3 = require('sqlite3');

// --> Indicamos la ubicacion de la Base de Datos
const Database = Ubicacion.resolve(__dirname, './Productos.db');

// --> Creamos la conexion con la Base de Datos
const ConexionBD = new SQLite3.Database(Database, (error) => {
    if (error) {
        console.error('No se pudo crear correctamente la Base de Datos ⛔', error.message);
    } else {
        console.log('Base de Datos creada Correctamente ✅');

        // --> Creamos la Tabla Productos
        ConexionBD.exec(
            `CREATE TABLE IF NOT EXISTS Productos(
                IDProducto INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT NOT NULL,
                Precio FLOAT NOT NULL,
                Stock INTEGER NOT NULL,
                Descripcion TEXT NOT NULL,
                Imagen TEXT
            )`,
            (error) => {
                if (error) {
                    console.error('Error al Crear la Tabla Productos ⛔', error.message);
                } else {
                    console.log('Tabla Productos creada Correctamente ✅');
                }
            }
        );
    }
});

// --> Exportamos la conexion para utilizarla en los controladores
module.exports = ConexionBD;
