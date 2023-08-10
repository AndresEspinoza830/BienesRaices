import bcrypt from "bcrypt";

const usuarios = [
  {
    nombre: "Andres",
    email: "andres@gmail.com",
    confirmado: 1,
    password: bcrypt.hashSync("password", 12),
  },
];

export default usuarios;
