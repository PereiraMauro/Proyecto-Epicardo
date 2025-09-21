import express from "express";
import preciosRouter from "./routes/precios.js";

const app = express();
const PORT = 3000;

app.use("/api", preciosRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
