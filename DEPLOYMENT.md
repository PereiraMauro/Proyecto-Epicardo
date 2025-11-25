# 🚀 Guía de Despliegue - Epicardo

## 📋 Resumen
Esta guía te llevará paso a paso para desplegar **Epicardo** en plataformas gratuitas.

## 🏗️ Arquitectura de Despliegue

### Backend → Railway (Gratuito)
- ✅ Hosting gratuito ilimitado
- ✅ Deploy automático desde GitHub
- ✅ HTTPS automático
- ✅ Variables de entorno incluidas

### Frontend → Netlify (Gratuito)
- ✅ Hosting estático gratuito
- ✅ CDN global
- ✅ HTTPS automático
- ✅ Deploy automático desde GitHub

---

## 🚀 PASO 1: Desplegar Backend en Railway

### 1.1 Preparar el repositorio
```bash
# Asegúrate de que tu código esté en GitHub
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

### 1.2 Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Conecta tu repositorio

### 1.3 Configurar el proyecto
1. Railway detectará automáticamente que es un proyecto Node.js
2. Configura el directorio raíz como `/Backend`
3. Railway usará automáticamente `npm start` para iniciar el servidor

### 1.4 Obtener la URL del backend
- Una vez desplegado, Railway te dará una URL como: `https://tu-proyecto-production.up.railway.app`
- **¡GUARDA ESTA URL!** La necesitarás para el frontend

---

## 🌐 PASO 2: Desplegar Frontend en Netlify

### 2.1 Preparar el frontend
1. Ve a [netlify.com](https://netlify.com)
2. Regístrate con tu cuenta de GitHub
3. Haz clic en "New site from Git"
4. Conecta tu repositorio

### 2.2 Configurar el build
- **Build command**: (dejar vacío, es un sitio estático)
- **Publish directory**: `/Frontend`
- **Base directory**: `/Frontend`

### 2.3 Actualizar la URL del backend
Una vez que tengas la URL de Railway, actualiza el archivo `Frontend/epic.js`:

```javascript
// Línea 11, cambia esta URL:
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000'  // Desarrollo local
  : 'https://TU-URL-DE-RAILWAY.up.railway.app'; // ← Cambia esta URL
```

### 2.4 Hacer commit y push
```bash
git add .
git commit -m "Actualizar URL de backend para producción"
git push origin main
```

Netlify detectará automáticamente los cambios y redesplegará.

---

## 🔧 PASO 3: Configurar CORS (Si es necesario)

Si tienes problemas de CORS, actualiza `Backend/index.js`:

```javascript
// Agregar tu dominio de Netlify a los orígenes permitidos
app.use(cors({
  origin: [
    "http://127.0.0.1:5500", 
    "http://localhost:5500",
    "https://tu-sitio.netlify.app", // ← Tu URL de Netlify
    "https://epicardo.netlify.app"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
```

---

## ✅ PASO 4: Verificar el Despliegue

### 4.1 Probar el backend
Visita: `https://tu-url-railway.up.railway.app/api/cotizaciones`
- Deberías ver datos JSON con las cotizaciones

### 4.2 Probar el frontend
Visita tu sitio de Netlify y:
1. Verifica que se carguen las cotizaciones
2. Prueba la calculadora con diferentes valores
3. Verifica que los cálculos sean correctos

---

## 🎯 URLs Finales

- **Backend**: `https://tu-proyecto-production.up.railway.app`
- **Frontend**: `https://tu-sitio.netlify.app`

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:
1. Haz commit y push a GitHub
2. Railway y Netlify se actualizarán automáticamente
3. ¡Listo! Tu sitio estará actualizado

---

## 🆘 Solución de Problemas

### Error de CORS
- Verifica que la URL del backend en el frontend sea correcta
- Asegúrate de que el dominio de Netlify esté en la lista de CORS del backend

### Error 404 en el backend
- Verifica que Railway esté usando el directorio `/Backend`
- Asegúrate de que el archivo `package.json` tenga el script `start`

### El frontend no carga datos
- Verifica la consola del navegador para errores
- Asegúrate de que la URL del backend sea correcta
- Prueba el endpoint del backend directamente

---

¡Tu proyecto Epicardo estará funcionando en producción! 🎉
