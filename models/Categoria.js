import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Categoria = sequelize.define("categorias", {
  nombre: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
});

export default Categoria;
