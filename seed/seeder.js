import categorias from "./categorias.js";
import precios from "./precios.js";
import sequelize from "../config/db.js";
import { Categoria, Precio } from "../models/index.js";

const importarDatos = async () => {
  try {
    //Autenticar
    await sequelize.authenticate();

    //Generar las columnas
    await sequelize.sync();

    //insertamos los datos
    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios),
    ]);

    console.log("Datos importados correctamente");
    process.exit(0); //Termino la ejecucion pero es correcto
  } catch (error) {
    console.log(error);
    process.exit(1); //Termino la ejecucion pero hay un error
  }
};

const eliminarDatos = async () => {
  try {
    await Promise.all([
      Categoria.destroy({ where: {}, truncate: true }),
      Precio.destroy({ where: {}, truncate: true }),
    ]);
    console.log("Datos eliminados correctamente");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  await importarDatos();
}

if (process.argv[2] === "-e") {
  await eliminarDatos();
}
