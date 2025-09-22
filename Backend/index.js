import express from "express";
import cors from "cors";
import preciosRouter from "./routes/precios.js";

const app = express();
const PORT = 3000;

// ✅ habilita CORS para cualquier origen (puede ajustarse después)
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"], 
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));


app.use("/api", preciosRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

