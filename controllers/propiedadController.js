import { validationResult } from "express-validator";
import { Precio, Categoria, Propiedad } from "../models/index.js"; //contiene todas las relaciones

const admin = (req, res) => {
  res.render("propiedades/admin", {
    pagina: "Mis propiedades",
    barra: true,
  });
};

//Formulario para crear nueva propiedad
const crear = async (req, res) => {
  //Consultar modelo de precio y categorias
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]);

  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    barra: true,
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: {},
  });
};

const guardar = async (req, res) => {
  //validacion
  let resultado = validationResult(req);

  //Si hay errores
  if (!resultado.isEmpty()) {
    //Consultar modelo de rpecio y categoria
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      barra: true,
      categorias,
      precios,
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      datos: req.body,
    });
  }

  //Crear registro
  const {
    titulo,
    descripcion,
    habitaciones,
    estacionamiento,
    wc,
    calle,
    lat,
    lng,
    precio: precioId,
    categoria: categoriaId,
  } = req.body;

  const { id: usuarioId } = req.usuario;

  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
      usuarioId,
      imagen: "",
    });

    const { id } = propiedadGuardada;

    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
};

export { admin, crear, guardar };
