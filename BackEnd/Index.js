const Express= require('express')
const cors = require('cors');
const path = require('path');

// --> Inicializamos Express
const App = Express();

// --> Indicamos el puerto
const PORT = process.env.PORT || 3001;

// --> Middlewares
App.use(Express.json());
App.use(cors());

// --> Importamos las rutas
const RegistroRoutes = require('./src/Routes/Registro.Route');

// --> Habilitamos el acceso a las imagenes
App.use(
    '/uploads',
    Express.static(path.resolve(__dirname, 'uploads'))
);

// --> Utilizamos las rutas de productos
App.use('/api/Productos', RegistroRoutes);

// --> Iniciamos el servidor
App.listen(PORT,()=>{
    console.log(`Servidor corriendo en el puerto http:localhost:${PORT}`)
})