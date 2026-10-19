
const express = require('express');
const Router = express.Router();

const ubicacionCarpeta=path.resolve(__dirname, '../uploads');

const { RegistrarProducto } = require('../Controller/Registro.Controller');

const ConfiguracionImagenes = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ubicacionCarpeta);
    },

    filename: (req, file, cb) => {
        const Extension = path.extname(file.originalname);
        cb(null, `${Date.now()}${Extension}`);
    }
});

const SubirImagen = multer({
    storage: ConfiguracionImagenes
});

Router.post('/RegistrarProducto', SubirImagen.single('imagen'), RegistrarProducto);

// --> Exportamos las rutas
module.exports = Router;
