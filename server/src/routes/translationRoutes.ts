import express from "express";
import translator from "../controllers/translationController";

const router = express.Router();

router.get("/translate/:phrase", translator);

export default router;
