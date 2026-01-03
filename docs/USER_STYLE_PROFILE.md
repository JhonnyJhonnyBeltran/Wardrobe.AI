# Perfil de Estilo del Usuario

## Descripción

El cuestionario de estilo captura información clave sobre las preferencias y características del usuario para personalizar las recomendaciones en toda la app.

## Campos guardados en Supabase

Los siguientes campos se guardan en la tabla `users`:

### Campos principales

- `age_range`: Rango de edad ('18-24', '25-34', '35-44', '45-54', '55+')
- `gender`: Género ('hombre', 'mujer', 'no-binario', 'prefiero no decir')
- `height`: Altura en centímetros (número)
- `height_range`: Rango de altura ('bajo', 'medio', 'alto')
- `preferred_styles`: Array de estilos preferidos (ej: ['casual', 'elegante', 'deportivo'])
- `uses_accessories`: Boolean - si le gustan los accesorios
- `visual_style_preferences`: Array de preferencias visuales (ej: ['minimalista', 'colorido'])
- `style_completed`: Boolean - indica si completó el cuestionario

## Uso en diferentes módulos

### 1. Chatbot (/chat)

El chatbot puede acceder al perfil del usuario para dar sugerencias personalizadas:

```typescript
import { useUser } from "@/store/userStore";

function ChatPage() {
  const { user } = useUser();

  // Al enviar mensaje al chatbot, incluir el contexto del usuario
  const sendMessage = async (message: string) => {
    const contextPrompt = `
      Usuario:
      - Género: ${user.gender}
      - Edad: ${user.ageRange}
      - Altura: ${user.height}cm
      - Estilos preferidos: ${user.preferredStyles?.join(", ")}
      - Accesorios: ${user.usesAccessories ? "Sí" : "No"}
      
      Pregunta: ${message}
    `;

    // Enviar a tu API de chat con el contexto
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: contextPrompt }),
    });
  };
}
```

### 2. Generador de Outfits (/create)

Usar las preferencias para filtrar y priorizar recomendaciones:

```typescript
import { useUser } from "@/store/userStore";

function OutfitGenerator() {
  const { user } = useUser();

  // Filtrar prendas según preferencias
  const generateOutfit = () => {
    // Priorizar estilos preferidos del usuario
    const styleWeights = user.preferredStyles?.reduce((acc, style) => {
      acc[style] = 2.0; // Mayor peso a estilos preferidos
      return acc;
    }, {});

    // Si no usa accesorios, excluirlos de las sugerencias
    const includeAccessories = user.usesAccessories;

    // Considerar altura para recomendaciones de longitud
    const heightCategory = user.heightRange;
    // ej: Si es 'bajo', evitar pantalones muy largos
  };
}
```

### 3. Perfil (/profile)

Ya está implementado - muestra todas las preferencias en una sección dedicada:

- Género y edad
- Altura
- Estilos preferidos (badges)
- Preferencias visuales (badges)
- Uso de accesorios

## Ejemplo de consulta SQL

Para obtener el perfil completo desde Supabase:

```typescript
const { data: userProfile } = await supabase
  .from("users")
  .select(
    `
    id,
    name,
    email,
    age_range,
    gender,
    height,
    height_range,
    preferred_styles,
    uses_accessories,
    visual_style_preferences,
    style_completed
  `
  )
  .eq("id", userId)
  .single();
```

## Recomendaciones de uso

### En el Chatbot:

1. **Saludos personalizados**: "Hola [nombre], veo que te gusta el estilo [estilo]"
2. **Sugerencias contextuales**: Si pregunta por pantalones y es alto, sugerir cortes específicos
3. **Filtrado automático**: No mostrar accesorios si `usesAccessories = false`

### En el Generador:

1. **Filtros por defecto**: Aplicar filtros basados en `preferredStyles`
2. **Algoritmo de matching**: Dar mayor peso a prendas que coincidan con preferencias
3. **Sugerencias de compra**: Recomendar tiendas según estilo y presupuesto

### En Recomendaciones:

1. **Trending personalizados**: Filtrar tendencias por género y edad
2. **Outfits del día**: Generar basado en preferencias guardadas
3. **Notificaciones**: "Nuevas prendas [estilo] disponibles"

## Testing

Para probar el sistema:

1. Registra un usuario nuevo
2. Completa el cuestionario de estilo
3. Verifica en Supabase que los datos se guardaron
4. Comprueba que aparecen en `/profile`
5. Úsalos en el chatbot/generador

## TODO

- [ ] Implementar lógica de matching en el generador de outfits
- [ ] Integrar contexto en el prompt del chatbot
- [ ] Añadir analytics de qué estilos son más populares
- [ ] Permitir editar preferencias desde el perfil
