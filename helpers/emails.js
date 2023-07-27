import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_POST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  //Enviar el email
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Confirma tu cuenta en BienesRaices.com",
    text: "Confirma tu cuenta en BienesRaices.com",
    html: `
        <p>Hola ${nombre}, comprueba tu cuenta en Bienes Raices</p>
        <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:</p>
        <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 5005
    }/auth/confirmar/${token}">Confirmar Cuenta</a>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>

    `,
  });
};

const olvideMiPassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_POST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  //Enviar el email
  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Reestablece tu password en Bienes Raices",
    text: "Confirma tu cuenta en BienesRaices.com",
    html: `
        <p>Hola ${nombre}, has solicitado reestablecer tu password en Bienes Raices</p>
        <p>Sigue el siguiente enlace para cambiar tu transeña:</p>
        <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 5005
    }/auth/olvide-password/${token}">Reestablecer password</a>

        <p>Si tu no solicitaste este cambio de password ignora este mensaje</p>

    `,
  });
};

export { emailRegistro, olvideMiPassword };
