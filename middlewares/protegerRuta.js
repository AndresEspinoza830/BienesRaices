import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const protegerRuta = async (req, res, next) => {
  //Verificar si hay un token
  const { _token } = req.cookies;

  //Si no existe el token
  if (!_token) {
    return res.redirect("/auth/login");
  }

  //Comprobar el token
  try {
    const decode = jwt.verify(_token, process.env.JWT_SECRET);
    const usuario = await Usuario.scope("eliminarPassword").findByPk(decode.id); //debemos quitar algunos campos como la contrasñea por seguridad
    //almacenar la usuario en el req
    if (usuario) {
      req.usuario = usuario;
    } else {
      return res.redirect("/auth/login");
    }
    return next();
  } catch (error) {
    return res.clearCookie("_token").redirect("/auth/login");
  }
};

export default protegerRuta;
