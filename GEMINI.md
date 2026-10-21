# Wardrobe.AI (Klozet) - Reglas de Proyecto y Diseño

## Estándares Obligatorios de Frontend y UI (Impeccable & Taste-Skill)

En este proyecto (Klozet), todo desarrollo, componente o pantalla debe seguir estrictamente las directrices de las skills configuradas en `.agents/skills/`:

1. **`impeccable`**:
   - Respetar el suelo artesanal de calidad (`craft-floor.md`).
   - Cuidar la consistencia de espaciado, tipografía, microinteracciones y estados (empty states, skeletons de carga, mensajes de error elegantes).
   - Mantener accesibilidad y adaptabilidad perfecta a resoluciones móviles y de escritorio.

2. **`taste-skill`**:
   - Tolerancia cero a clichés de IA ("AI slop"): sin badges o pastillas innecesarias tipo "IA personal", sin tres tarjetas repetitivas, sin gradientes borrosos ni sombras blandas desmesuradas.
   - Enfoque editorial y de moda: tipografía con identidad, fotografía de alta calidad y paletas coherentes con la identidad de Klozet.

3. **`apple-design`**:
   - Directrices Apple Human Interface Guidelines (HIG) para experiencia premium de app móvil.
   - Microinteracciones naturales, áreas de toque de 44x44pt mínimo, tipografía cuidada, materiales de vidrio translúcido y transiciones sin fricción.

4. **Flujo de Trabajo:**
   - Consultar siempre `./Obsidian/contexto.md` antes de cualquier modificación.
   - Probar que compila correctamente (`npm run build`) antes de cualquier commit.
   - Realizar commits descriptivos tras validación exitosa.

## Eficiencia de Tokens (Caveman Mode)
- Skill configurada en `.agents/skills/caveman`.
- Respuestas directas, concisas y sin ceremonias ("why many token when few do trick").
- Carga técnica y código fuente 100% íntegros y exactos.
- Edición quirúrgica (mostrar solo diffs/bloques relevantes).

## Navegación y Revisión Web (agent-browser)
- Skill configurada en `.agents/skills/agent-browser`.
- Siempre que se pida "revisa la pagina" o auditar una URL: usar `agent-browser` para navegar e interactuar mediante snapshots (`@eN`) y screenshots.
- Si se requieren credenciales para acceder a la web/sección privada: solicitarlas al usuario, introducirlas y acceder.
