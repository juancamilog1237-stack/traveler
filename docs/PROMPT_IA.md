# Prompt para investigar un viaje con IA

Copia todo lo que está dentro del bloque de abajo en ChatGPT, Gemini, Perplexity o Claude (idealmente con **búsqueda web activada**). Cambia lo que está entre `[CORCHETES]`.
La estructura ya va dentro del prompt; no hace falta adjuntar nada.

Cuando te responda, trae el JSON aquí y pide: *"sube este viaje"*.

---

```text
Eres un planificador de viajes experto e investigador meticuloso. Investiga en la web y arma un viaje COMPLETO con estos datos:

- Destino: [Perú: Lima, Cusco y Machu Picchu]
- Duración: [12] días
- Salida desde: Colombia (Bogotá y Medellín)
- Viajero: [pareja]
- Fecha aproximada: [mayo de 2027]

Devuelve ÚNICAMENTE un objeto JSON válido (sin texto antes ni después, sin ```, sin escapes de markdown como \_ o \:), con EXACTAMENTE la estructura del final. Reglas:

IDIOMA Y CONTEXTO
1. Todo en español neutro, pensando en un viajero colombiano.
2. Visa, vacunas y trámites: específicos para pasaporte colombiano, con link oficial.

EL VIAJE SE PLANEA COMPLETO 3 VECES: economico, medio y alto
3. No des "opciones": para cada nivel elige UN plan concreto. Cambian el hotel, las comidas, los traslados y varias actividades (miradores pagos vs. gratis, tours, experiencias exclusivas); la ruta y las ciudades son las mismas. Que cada nivel se sienta como un viaje distinto.
4. alojamiento: un objeto por ciudad con `noches` (los días del itinerario en que se duerme ahí; entre todas cubren cada noche del viaje, el último día normalmente no tiene noche) y un hotel elegido para `economico`, `medio` y `alto`. `precioNoche` es POR PERSONA compartiendo habitación doble (en hostal, la cama). En `incluye` pon lo que trae (desayuno, cena, onsen…).
5. itinerario[].comidas: para cada día y cada nivel, las comidas reales del día (desayuno, almuerzo, cena y snacks si aplica) con hora (HH:MM), lugar concreto, plato y costo por persona. El sitio arma el día en orden cronológico mezclando actividades, comidas y traslados, así que las horas deben encajar. Si el hotel de ese nivel incluye la comida, costo 0. Las comidas NO van como actividades.
6. actividades y traslados: si algo es solo para ciertos niveles (p. ej. ceremonia del té solo medio/alto, taxi en alto y bus en económico, vagón de primera clase en alto), ponle `niveles`. Si falta `niveles`, aplica a todos.
7. traslados: TODOS los desplazamientos pagos del día (aeropuerto, trenes, metro, buses, taxis, pases), cada uno con hora (HH:MM). No repitas un traslado como actividad. Con eso el sitio calcula el transporte; no lo pongas en presupuesto.

PRECIOS
8. Todos los precios en MONEDA LOCAL del destino y POR PERSONA, salvo en presupuesto.categorias donde `moneda` sea "USD" (vuelos y seguro van en USD).
9. `moneda.localPorUSD` = unidades de moneda local por 1 USD. `moneda.copPorUSD` = pesos colombianos por 1 USD. Usa tasas actuales y pon la fecha.
10. presupuesto.categorias: SOLO vuelos, seguro, visa, conectividad, compras y extras, con montos TOTALES del viaje por persona para los 3 niveles. Alojamiento, comida, transporte y entradas los calcula el sitio a partir del plan día a día; no los incluyas ni sumes totales.
11. Precios realistas y actuales. Actividades gratis = 0; el costo de una actividad es solo la entrada o el tour (la comida va en comidas).

ITINERARIO
12. Un objeto por día (dia 1..N). Cada día con 3 a 5 actividades con hora (HH:MM), duración, costo, tipo y un consejo útil cuando aplique.
13. Coordenadas reales (lat, lng con 4 decimales) para cada día y para cada actividad con lugar físico. Verifícalas.
14. Un planB por día (lluvia/cierres).

IMÁGENES (MUY IMPORTANTE)
15. Usa SOLO fotos de Wikimedia Commons (preferido), Unsplash o Pexels. Nunca inventes URLs.
16. Para Wikimedia usa la URL directa del archivo (https://upload.wikimedia.org/...) y en `fuente` la página del archivo (https://commons.wikimedia.org/wiki/File:...). Incluye autor real en `credito` y licencia exacta (p. ej. "CC BY-SA 4.0").
17. Pon: 1 portada horizontal espectacular, 4–8 fotos en meta.galeria, 1–3 fotos por día, foto en cada plato típico y en cada hotel cuando exista. `alt` descriptivo en español.

CONTENIDO
18. comoLlegar: 2–3 rutas reales de vuelo desde Bogotá/Medellín con aerolíneas, escalas, duración y rango de precio ida y vuelta en USD.
19. Hoteles y restaurantes con link oficial o de reserva cuando exista.
20. comida.platosTipicos: 4–6 platos típicos del destino.
21. infoPractica: clima de los 12 meses (temperatura mín/máx promedio °C y lluvia mm), seguridad, enchufes, propinas, idioma, conectividad, transporte local, 6–8 frases útiles con pronunciación, 4–6 apps, consejos, estafas comunes y un checklist de 10–14 ítems.
22. meta.colorAcento: un color HEX que represente el destino (oscuro, buen contraste con blanco).
23. fuentes: 4–8 fuentes reales que usaste (oficiales de turismo, embajadas, transporte).
24. meta.fechaInvestigacion = fecha de hoy (AAAA-MM-DD).

ESTRUCTURA EXACTA (usa estos nombres de campo, sin agregar ni renombrar; `?` = opcional; `a|b` = uno de esos valores)
{
  "meta": { "titulo", "resumen", "destino", "pais", "region": "Asia|Europa|Sudamérica|Centroamérica y Caribe|Norteamérica|África|Oceanía|Medio Oriente", "duracionDias": 12, "mesesIdeales": [4,5], "temporadaRecomendada", "estilo": "mochilero|medio|lujo", "dificultad": "facil|moderada|exigente", "idealPara": ["Parejas"], "etiquetas": ["historia"], "fechaInvestigacion": "AAAA-MM-DD", "colorAcento": "#8a4b2f", "portada": IMAGEN, "galeria": [IMAGEN] },
  "moneda": { "codigo": "PEN", "simbolo": "S/", "localPorUSD": 3.7, "copPorUSD": 4000, "fechaTasa": "AAAA-MM-DD" },
  "comoLlegar": { "resumen", "aeropuertoLlegada", "delAeropuertoAlCentro", "rutas": [{ "origen", "ruta": "BOG → LIM", "aerolineas": [""], "duracion": "4 h", "escalas": 0, "precioUSD": { "min": 300, "max": 500 } }] },
  "itinerario": [{
    "dia": 1, "titulo", "ciudad", "coords": { "lat", "lng" }, "resumen", "imagenes": [IMAGEN],
    "actividades": [{ "niveles?": ["medio","alto"], "hora": "09:00", "nombre", "descripcion", "duracion": "1 h 30 min", "costo": 0, "tipo": "cultura|naturaleza|comida|compras|aventura|vida-nocturna|descanso|transporte", "coords?": { "lat", "lng" }, "link?", "imagen?": IMAGEN, "consejo?" }],
    "comidas": { "economico": [COMIDA], "medio": [COMIDA], "alto": [COMIDA] },
    "traslados": [{ "niveles?": ["economico"], "hora": "08:00", "de", "a", "medio", "duracion": "45 min", "costo": 5, "consejo?" }],
    "planB?"
  }],
  "presupuesto": { "notas", "categorias": [{ "categoria": "vuelos|seguro|visa|conectividad|compras|extras", "descripcion", "moneda": "local|USD", "economico": 0, "medio": 0, "alto": 0 }] },
  "alojamiento": [{ "ciudad", "noches": [1,2,3], "economico": HOTEL, "medio": HOTEL, "alto": HOTEL }],
  "comida": { "platosTipicos": [{ "nombre", "descripcion", "precioAprox": 0, "imagen?": IMAGEN }] },
  "infoPractica": {
    "visa": { "requiere": true, "tipo", "detalle", "link?" },
    "clima": [{ "mes": 1, "tempMin": 0, "tempMax": 0, "lluviaMm": 0 }],   // exactamente 12, mes 1..12
    "vacunas": [""], "seguridad": "", "enchufe": { "tipo", "voltaje", "necesitaAdaptador": true },
    "propinas": "", "idioma": "", "conectividad": "", "transporteLocal": "",   // texto, no objetos
    "frases": [{ "es", "local", "pronunciacion" }], "apps": [{ "nombre", "para" }],
    "consejos": [""], "estafas": [""], "checklist": [""]   // listas de texto
  },
  "fuentes": [{ "titulo", "url" }]
}
COMIDA = { "hora": "13:00", "momento": "desayuno|almuerzo|cena|snack", "lugar", "plato", "costo": 0, "link?", "coords?": { "lat", "lng" } }
HOTEL  = { "nombre", "zona", "tipo", "precioNoche": 0, "incluye?": "texto", "descripcion", "link": "https://…", "imagen?": IMAGEN }
IMAGEN = { "url", "alt", "credito", "licencia", "fuente" }
Los campos sin valor de ejemplo son texto. Si no tienes una foto real, omite el campo opcional en vez de poner null.

Antes de responder, revisa que cada día tenga comidas para los 3 niveles, que las noches del alojamiento cubran todo el viaje y que el JSON use exactamente esta estructura.
```

---

## Qué hago yo cuando me pegas el JSON

1. Lo guardo como `src/content/viajes/<slug>.json` (el slug sale del título, p. ej. `peru-machu-picchu-12-dias`).
2. `npm run imagenes -- <slug>`: descarga las fotos al proyecto, las optimiza el build y reporta las rotas (las busco de reemplazo con `npm run buscar-imagen -- "lugar"`).
3. `npm run validar`: si algún campo no cumple el esquema, lo corrijo o te digo qué falta.
4. Reviso que las sumas, tasas y coordenadas tengan sentido, y publico.
