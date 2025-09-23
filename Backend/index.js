// index.js
import express from "express";
import cors from "cors";
import preciosRouter from "./routes/precios.js";

const app = express();
const PORT = 3000;

// Habilitar CORS
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// Rutas
app.use("/api", preciosRouter);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
