import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/token.js";
import { emailRegistro, olvideMiPassword } from "../helpers/emails.js";

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrarUsuario = async (req, res) => {
  //validacion
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .run(req);

  await check("email").isEmail().withMessage("Eso no parece un email").run(req);

  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener minimo 6 caracteres")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Los passwords no son iguales")
    .run(req);

  let resultado = validationResult(req);

  //verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //hay errores
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Verificar que el usuario no sea duplicado
  const existeUsuario = await Usuario.findOne({
    where: { email: req.body.email },
  });

  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario ya esta registrado" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Hashear password
  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync(req.body.password, salt);

  //Crear usuario
  const usuario = await Usuario.create({
    nombre: req.body.nombre,
    email: req.body.email,
    password: passwordHash,
    token: generarId(),
  });

  //Envia email de confirmacion
  await emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  //Mostrar mensaje de confirmacion
  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje: `Hemos enviado un email a ${usuario.email}, presiona en el enlace`,
  });
};

//Funcion que comprueba una cuenta
const confirmarCuenta = async (req, res, next) => {
  const { token } = req.params;

  //Verificar si el token es valido
  const usuario = await Usuario.findOne({ where: { token: token } });

  //Si es no es valido
  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
      error: true,
    });
  }

  //Confirmar cuenta
  usuario.token = null; //El token es de unico uso, por lo volvemos null porque ya lo usamos
  usuario.confirmado = true;
  //Guardamos los cambios en la base de datos porqeu hasta aqui solo estan en memoria
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta se confirmo correctamente",
    error: false,
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Recupera tu acceso a Bienes Raices",
    csrfToken: req.csrfToken(),
  });
};

const resetPassoword = async (req, res) => {
  //validar y sanitizar(todavia no se hace)
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);

  let resultado = validationResult(req);

  //Si hay errores
  if (!resultado.isEmpty()) {
    return res.render("auth/olvide-password", {
      pagina: "Olvide Password",
      csrfToken: req.csrfToken(),
      email: req.body.email,
      errores: resultado.array(),
    });
  }

  //Verificar que exista el email en la base de datos
  const usuario = await Usuario.findOne({ where: { email: req.body.email } });

  //Si no existe el usuario
  if (!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Olvide Password",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario no esta registrado" }],
    });
  }

  //Generar token unico
  usuario.token = generarId();
  await usuario.save();

  //Enviar email
  await olvideMiPassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  res.render("templates/mensaje", {
    pagina: "Reestablece tu Password",
    mensaje: `Enviamos un enlace al correo: ${usuario.email} para reestablecer el password`,
  });
};

const comprobarToken = async (req, res, next) => {
  const { token } = req.params;

  //Verificar que exista el token en la base de datos
  const usuario = await Usuario.findOne({ where: { token } });

  //Si no hay usuario
  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Reestablece tu Password",
      mensaje: "Hubo un error al validar tu informacion, intenta de nuevo",
      csrfToken: req.csrfToken(),
      error: true,
    });
  }

  //Si, existe el usuario mostramos formuluario
  res.render("auth/reset-password", {
    pagina: "Reestalece tu Password ",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  //validar el nuevo password
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener minimo 6 caracteres")
    .run(req);

  let resultado = validationResult(req);

  //Si hay errores
  if (!resultado.isEmpty()) {
    return res.render("auth/reset-password", {
      pagina: "Reestalece tu Password ",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  //Identificar quien hace el cambio
  const usuario = await Usuario.findOne({ where: { token } }); //Ya sabemos que eixst el usuario

  //Hashear el apssword
  const salt = bcrypt.genSaltSync(12);
  usuario.password = bcrypt.hashSync(password, salt);
  usuario.token = null;
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Password resstablecido",
    mensaje: "El password se guardo correctamente",
  });
};

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Inciar Sesion",
    csrfToken: req.csrfToken(),
  });
};

const autenticar = async (req, res) => {
  //validacion
  await check("email").isEmail().withMessage("Eso no parece un Email").run(req);
  await check("password")
    .notEmpty()
    .withMessage("El password no es valido")
    .run(req);

  let resultado = validationResult(req);

  //si hay errores
  if (!resultado.isEmpty()) {
    return res.render("auth/login", {
      pagina: "Iniciar sesion",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { email, password } = req.body;
  //comprobar que el usuario existe
  const usuario = await Usuario.findOne({ where: { email } });

  //si no existe
  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario no existe" }],
    });
  }

  //Comprobar que el usuario este confirmado
  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Tu cuenta no ha sido confirmada" }],
    });
  }

  //Comprobar el password
  const isCorrectPassword = bcrypt.compareSync(password, usuario.password);

  //si no es correcta la contraseña
  if (!isCorrectPassword) {
    return res.render("auth/login", {
      pagina: "Iniciar sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Las credenciales no son correctas" }],
    });
  }

  //autenticar al usuario
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

  //almacenar en un cookie
  return res
    .cookie("_token", token, {
      httpOnly: true,
      secure: true,
    })
    .redirect("/mis-propiedades");
};

export {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  registrarUsuario,
  confirmarCuenta,
  resetPassoword,
  comprobarToken,
  nuevoPassword,
  autenticar,
};
