import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Precio = sequelize.define("precios", {
  nombre: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
});

export default Precio;
