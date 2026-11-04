# LEE-ACH — boutique de perfumería

Web estática responsive para presentar la identidad de LEE-ACH, explorar perfiles olfativos y preparar la incorporación del catálogo comercial. Esta primera versión es **privada y demostrativa**: no procesa pedidos, no contiene precios ni afirma stock.

## Estructura

- `dist/index.html`: páginas, estructura semántica y metadatos.
- `dist/styles.css`: sistema de diseño y estilos responsive.
- `dist/catalogo.js`: configuración comercial y perfiles editoriales de ejemplo.
- `dist/app.js`: enrutamiento, filtros, cuestionario, selección local y UI.
- `dist/assets/`: imágenes editoriales generadas y propuesta de logo.

## Requisitos comerciales pendientes

Antes de activar pedidos:

1. Sustituir los seis perfiles de ejemplo por productos **reales y confirmados**.
2. Confirmar marca, nombre, fotografías autorizadas, categoría, perfil olfativo y notas de cada producto.
3. Para cada presentación (3, 5, 10 y 30 ml), indicar precio PEN, stock y publicación activa. Los frascos completos requieren confirmación por separado.
4. Confirmar WhatsApp oficial, cobertura de envíos, costos, condiciones comerciales, políticas y métodos de pago.
5. Implementar un proceso real de pedido/cotización: el botón actual solo guarda preferencias locales.
6. Sustituir las fotos editoriales genéricas de cada perfil por fotografías reales de producto.
7. Revisar formalmente la variante final de logotipo (la versión integrada es una propuesta derivada).

No establecer `checkoutEnabled: true` sin implementar y probar la operación correspondiente. El sitio no simula pagos ni confirma compras.

## Pruebas básicas

```bash
node --check dist/catalogo.js
node --check dist/app.js
node tests/catalog.test.cjs
```

Flujos manuales clave: navegación y recarga directa en `#/catalogo`, filtros y búsqueda, ficha y selección de tamaños, añadir/cambiar/eliminar en Mi selección, persistencia tras recarga, cuestionario, menú móvil, Escape, teclado, enlaces de pie de página y vistas 375/768/1440 px.

## Limitaciones conscientes

- Los perfiles son ejemplos **no comerciales** y no representan inventario de LEE-ACH.
- `localStorage` guarda únicamente una selección local; no hay cuentas ni backend.
- Sin WhatsApp verificado, no se habilita checkout o envío de mensajes.
- El enrutamiento hash funciona en hosting estático y recarga directa, pero las fichas individuales no son páginas SEO independientes; pasar a generación estática por producto cuando el catálogo oficial exista.
- La fotografía editorial creada para el diseño es ilustrativa, no fotografía de inventario.
