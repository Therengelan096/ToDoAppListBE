import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dbConnection } from "./db/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "API To-Do List inicializada correctamente" });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "La ruta solicitada no existe",
  });
});

const startServer = async () => {
  await dbConnection();

  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
};

startServer();
