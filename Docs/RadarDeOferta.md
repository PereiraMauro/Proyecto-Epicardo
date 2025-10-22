# Radar  de ofertas  EPICARDO

## OBJETIVOS
 Hacer que los usuarios reciban alertas y puedan ver ofertas o variaciones de precio final ARGENTINO.

## FUCIONAMIENTOS 
1. **Deteccion**
  -rastreo periodicamente los precios de los juegos.
  -Identificar juegos con descuento activos y juegos gratuito.
  -Extraer info del juego. 
2. **Oferta**
  -Compara los precios con los historicos guardados.
  -Calificar descuento significativos como del 30 % por ejemplo como descuento O gratis.
3. **actualizacion automatica**
   -el radar se deve actualizar una vez al dia.
   -usar almazamiento para cachear resultados y evitar redundancia.

## integracion 
1.**EL RADAR TIENE LOS DATOS** de  epic game.

2.**SE ENVIA LA INFORMACION** con precio en USD.

3.**SE CALCULA EL PRECIO FINAL EN ars**  con impuestos.

4.**SE MUESTRA EL PRECIO FINAL** en la interfaz.

