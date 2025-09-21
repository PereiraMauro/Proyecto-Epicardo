# 📘 Documentación API – Epicardo Backend

### 🔹 Base URL (modo local)
```
http://localhost:3000/api
```

---

### 🔹 1. Obtener cotizaciones disponibles
**Endpoint:**  
```
GET /cotizaciones
```

**Respuesta ejemplo:**
```json
{
  "oficial": 1515,
  "blue": 1520,
  "tarjeta": 1969.5,
  "mayorista": 1475,
  "cripto": 1550
}
```

---

### 🔹 2. Calcular precio final con impuestos
**Endpoint:**  
```
GET /precio/:usd?tipo={opcional}
```

**Parámetros:**
- `:usd` → precio en dólares (ejemplo: 10, 20, 50).  
- `tipo` (query param, opcional) → tipo de cotización. Valores posibles:  
  - `tarjeta` (default)  
  - `oficial`  
  - `blue`  

**Ejemplos:**
```
GET /precio/10
GET /precio/10?tipo=oficial
GET /precio/10?tipo=blue
```

**Respuesta ejemplo:**
```json
{
  "tipo": "tarjeta",
  "base": "19695.00",
  "iva": "4135.95",
  "pais": "5908.50",
  "percepcion": "8862.75",
  "total": "38602.20"
}
```

---

### 🔹 3. Respuestas de error
- Si el valor en USD no es válido:
```json
{ "error": "El valor debe ser un número" }
```

- Si la API de cotizaciones no responde:
```json
{ "error": "No se pudo obtener la cotización" }
```

---

## 📌 Resumen para Frontend
1. **Mostrar las opciones de cotización** → usar `GET /cotizaciones`.  
2. **Seleccionar un tipo de dólar** → enviar `tipo` como query param en `/precio`.  
3. **Calcular el precio final** → mostrar `base`, `iva`, `pais`, `percepcion`, `total`.  
