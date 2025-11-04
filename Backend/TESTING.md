# 🧪 Guía de Testing - Backend Epicardo

## 🚀 Formas de Testear el Backend

### 1️⃣ **Script Automatizado (PowerShell)**

Ejecuta el script de pruebas desde PowerShell:

```powershell
cd Backend
.\test-endpoints.ps1
```

---

### 2️⃣ **Comandos PowerShell Individuales**

#### Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
```

#### Obtener Cotizaciones
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/cotizaciones" -UseBasicParsing
$response.Content | ConvertFrom-Json
```

#### Obtener Rates
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/rates" -UseBasicParsing
$response.Content | ConvertFrom-Json
```

#### Calcular Precio
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/precio/100?tipo=tarjeta_pesos" -UseBasicParsing
$response.Content | ConvertFrom-Json
```

#### Refresh Rates (POST)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/rates/refresh" -Method POST -UseBasicParsing
```

---

### 3️⃣ **Desde el Navegador**

Abre estos URLs directamente en tu navegador:

- **Health Check**: http://localhost:3000/api/health
- **Cotizaciones**: http://localhost:3000/api/cotizaciones
- **Rates**: http://localhost:3000/api/rates
- **Precio USD 100**: http://localhost:3000/api/precio/100?tipo=tarjeta_pesos

---

### 4️⃣ **Usando curl (si está instalado)**

```bash
# Health
curl http://localhost:3000/api/health

# Cotizaciones
curl http://localhost:3000/api/cotizaciones

# Rates
curl http://localhost:3000/api/rates

# Precio
curl "http://localhost:3000/api/precio/100?tipo=tarjeta_pesos"

# Refresh (POST)
curl -X POST http://localhost:3000/api/rates/refresh
```

---

### 5️⃣ **Desde el Frontend**

Abre `Frontend/index.html` en tu navegador (con Live Server o similar) y verifica que:
- Se carguen las cotizaciones automáticamente
- La calculadora funcione correctamente
- Los precios se calculen bien

---

### 6️⃣ **Herramientas Externas**

- **Postman**: Importa los endpoints y prueba cada uno
- **Thunder Client** (VS Code): Extensión para probar APIs
- **Insomnia**: Cliente REST moderno

---

## 📋 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/cotizaciones` | Todas las cotizaciones |
| GET | `/api/rates` | Rates USD/ARS (oficial y blue) |
| GET | `/api/precio/:usd?tipo=` | Calcular precio final |
| POST | `/api/rates/refresh` | Forzar actualización de rates |

---

## ✅ Checklist de Pruebas

- [ ] Health check responde OK
- [ ] Cotizaciones se obtienen correctamente
- [ ] Rates retornan datos válidos
- [ ] Cálculo de precios funciona
- [ ] Diferentes tipos de pago funcionan
- [ ] Refresh de rates funciona
- [ ] Frontend se conecta correctamente
- [ ] CORS permite peticiones del frontend

---

## 🔧 Troubleshooting

### Error de CORS
Si ves errores de CORS, verifica que el frontend esté en un puerto permitido:
- `http://localhost:5500`
- `http://127.0.0.1:5500`

### Error 503
Si rates no responde, verifica que los providers estén funcionando.

### Error 500
Revisa la consola del servidor para ver el error específico.

