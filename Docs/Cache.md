# SISTEMA DE CACHE
   El **sistema de cache** en el backend tiene que asegurar **la optimizacion de rendimiento y reducir llamadas** hacia las APIs.

   Cada vez que el radar de ofertas pregunta los precios/promociones, la respuesta se guardaria temporalmente en el **cache**, para reutilizarla en futuras consultas en el periodo de tiempo determinado(24hs).

## objetivo pricipal 
1.**Reducir las llamadas a la API**
    Evitar   que el sistema haga multiples llamadas inecesarias en poco tiempo.

2.**Aumentar la velocidad de respuesta**
   Los datos se serviran mas rapido con el cache que con la API.

3.**Estabilidad**
   Menor trafico y bloqueos por menos peticiones.

4.**Mantener actualizaciones** con rendimientos.

## FUNCIONAMIENTO

1. El usuario abre la sección del **Radar de Ofertas**.  
2. El backend revisa si los datos de la Epic Games Store ya están en la caché.  
   -Si **existen y no han expirado**, los devuelve directamente.  
   -NO **no existen o ya expiraron**, se realiza una nueva solicitud a la API.  
3. Los datos obtenidos se guardan nuevamente en la caché con un **tiempo de expiración (TTL)**, por ejemplo: 24 horas.  

