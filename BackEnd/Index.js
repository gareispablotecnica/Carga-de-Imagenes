const Express= require('express')
const App = Express()

const PORT = process.env.PORT || 3001

App.use(Express.json())
App.use(cors())

App.listen(PORT,()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})