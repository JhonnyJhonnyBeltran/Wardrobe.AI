# Asistente IA Premium (Roadmap)

Este documento detalla la estrategia y viabilidad técnica para la futura "Killer Feature" premium de Wardrobe.AI: Un asistente personal de moda inteligente.

## Visión del Producto
Los usuarios Premium tendrán acceso a un chat interactivo con un estilista personal con personalidad amable. 
El asistente será capaz de:
1. Conocer todo el armario del usuario.
2. Sugerir combinaciones con prendas específicas (ej. "¿Cómo combino mi polo Ralph Lauren?").
3. Sugerir outfits enteros basándose en el clima o el estilo.
4. Mostrar un **botón accionable** que lleve directamente a la pantalla de crear el outfit con las prendas que la IA acaba de sugerir ya auto-seleccionadas.

## Estrategia Técnica y Costes

### Modelo de IA (Externa vs Interna)
- **Decisión recomendada:** Uso de una API externa (ej. GPT-4o-mini de OpenAI, Gemini 1.5 Flash de Google, o Claude 3 Haiku). 
- **Razonamiento:** Coste por uso (pago por token) extremadamente bajo. Hospedar un modelo de código abierto propio (Llama 3 8B, Phi-3) requiere instancias de GPU dedicadas ($150-$300/mes) que no escalan bien cuando hay pocos usuarios o picos de tráfico, aniquilando el margen de beneficio.
- **Coste estimado (API externa):** Menos de $0.05 al mes por usuario premium muy activo. Genera un margen de beneficio altísimo si la suscripción ronda los $5-$10/mes.

### Conocimiento del Armario (RAG & Inyección de Contexto)
- No se re-entrena ningún modelo de inteligencia artificial.
- Se utiliza inyección de contexto. Cuando el usuario hace una petición, el backend consulta Supabase, extrae la lista de prendas (JSON) e inyecta esto en el `System Prompt` de forma invisible.
- Ejemplo de Prompt interno: *"Eres el estilista personal del usuario. Su armario actual contiene: [ID: 1, Polo Ralph Lauren Blanco], [ID: 2, Pantalón Vaquero Azul]. Ayúdale a combinar."*

### Creación Automática de Outfits (Tool Calling / Function Calling)
- La IA no solo responderá texto plano, sino estructurado (JSON) mediante "Tool Calling".
- El modelo devolverá la respuesta amistosa y un array con los IDs de las prendas recomendadas.
- El frontend en Next.js leerá el array de IDs y pintará un botón: **"Crear Outfit con estas prendas"**.
- Al pulsarlo, se usará el router de Next.js (`router.push('/create?items=ID1,ID2')`) para auto-poblar el formulario de creación de outfits con esas prendas.

## Tareas Futuras
1. Integrar el SDK de OpenAI / Vercel AI SDK.
2. Crear endpoint en `/api/chat` que haga el fetch de Supabase e inyecte el contexto de la ropa.
3. Configurar la "tool" de creación de outfits en la definición de la IA.
4. Crear la UI del chat (burbujas, animaciones) e incrustar los botones accionables (`CallToAction`).
