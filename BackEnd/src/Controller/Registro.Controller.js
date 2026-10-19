
const ConexionBD = require('../Database/db.js');
// --> Importamos los modulos necesarios
// --> fs para manejar archivos y path para manejar rutas de archivos
const fs = require('fs');
const path = require('path');

// --> Funcion para Registrar Productos
const RegistrarProducto = async (req, res) => {
    try {
        // --> Obtenemos los datos del producto
        const { Nombre, Precio, Stock, Descripcion } = req.body;
        const Imagen = req.file ? req.file.filename : null;
        // --< Ternario ? (si) - :(no)

        // --> Validamos los campos obligatorios
        if (!Nombre || Precio === undefined || Precio === '' || Stock === undefined || Stock === '' || !Descripcion) {
            if(req.file) fs.unlinkSync(req.file.path , ()=>{});

            return res.status(400).json({
                Mensaje: 'Debe completar todos los campos obligatorios'
            });
        }

        const query = `INSERT INTO Productos
            (Nombre, Precio, Stock, Descripcion, Imagen)
            VALUES (?, ?, ?, ?, ?)`

        // --> Ejecutamos la consulta SQL
        ConexionBD.run(query, [Nombre, Precio, Stock, Descripcion, Imagen],
            function (error) {
                if (error) {

                    if(req.file) fs.unlinkSync(req.file.path , ()=>{}); 
                    // const Imagen = req.file ? req.file.filename : null;
                    // --> Ternario ? (si) - :(no)

                    console.error('Error al Registrar Producto ⛔', error.message);

                    return res.status(500).json({
                        Mensaje: 'No se pudo registrar el producto'
                    });
                }

                // --> Respondemos con el ID generado
                return res.status(201).json({
                    Mensaje: 'Producto registrado correctamente ✅',
                    IDProducto: this.lastID
                });
            }
        );

    } catch (error) {
        console.error('Error inesperado al Registrar Producto ⛔', error);

        return res.status(500).json({
            Mensaje: 'Error interno del servidor'
        });
    }
}



// --> Exportamos las funciones del controlador
module.exports = { RegistrarProducto };
