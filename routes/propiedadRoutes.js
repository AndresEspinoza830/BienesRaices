import { Router } from "express";
import { admin, crear } from "../controllers/propiedadController.js";

const router = Router();

router.get("/mis-propiedades", admin);
router.get("/propiedades/crear", crear);

export default router;
