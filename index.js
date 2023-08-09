import express from "express"; //module -> configurado en el package.json
import csrf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadRoutes from "./routes/propiedadRoutes.js";
import sequelize from "./config/db.js  ";

//Esta variable contiene toda la informacion de express
const app = express();

//Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }));

//Habilitar cookie parser
app.use(cookieParser());

//Habilitar CSURF
app.use(csrf({ cookie: true }));

//Habilitar pug
app.set("view engine", "pug");
app.set("views", "./views");

//Base de datos
try {
  await sequelize.authenticate();
  sequelize.sync();
  console.log("Conexion exitosa a la base  de datos");
} catch (error) {
  console.error("Hubo un error con sequelize", error);
}

//Archivos estaticos
app.use(express.static("public"));

//Routing
app.use("/auth", usuarioRoutes);
app.use("/", propiedadRoutes);

const PORT = 5005;
//Servidor escuchando un puerto
app.listen(PORT, () => {
  console.log(`Escuchando servidor desde el puerto ${PORT}`);
});
