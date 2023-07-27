import { Router } from "express";
import {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  registrarUsuario,
  confirmarCuenta,
  resetPassoword,
  comprobarToken,
  nuevoPassword,
  autenticar,
} from "../controllers/usuarioController.js";

//variable que administra las routes
const router = Router();

router.get("/login", formularioLogin);
router.post("/login", autenticar);

//Registros de usuario
router.get("/registro", formularioRegistro);
router.post("/registro", registrarUsuario);

//Confirmar token para el registro de cuenta
router.get("/confirmar/:token", confirmarCuenta);

//Rcuperar contraseña
router.get("/olvide-password", formularioOlvidePassword);
router.post("/olvide-password", resetPassoword);

//Almacena el nuevo password
router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword);

export default router;
