---
name: agent-browser
description: Fast browser automation CLI for AI agents. Use whenever the user asks to "revisa la pagina", "revisar la web", navigate to any website, interact with pages, fill forms, click buttons, take screenshots, inspect UI/UX, or test web applications. Also handles authentication and logins; if credentials or passwords are needed to access the site, ask the user, enter them, and resume.
---

# agent-browser

Browser automation CLI for navigating, testing, and reviewing web applications via Chrome/Chromium and accessibility-tree snapshots (`@eN`).

## Regla de Uso Obligatoria: "Revisa la Página"
Siempre que el usuario solicite revisar una página web ("revisa la página", "comprueba la web", "mira esta url", etc.):
1. Usar `agent-browser` para navegar a la URL indicada.
2. Si el acceso requiere inicio de sesión, credenciales o contraseñas, **pedírselas directamente al usuario**, introducirlas mediante `fill`/`click` y volver a acceder.
3. Tomar snapshots interactivos (`agent-browser snapshot -i`) y capturas (`agent-browser screenshot <ruta>.png`) para auditar la interfaz y el comportamiento.
4. Reportar los hallazgos con rigor técnico y concisión (Caveman mode).

## Flujo Básico de Comandos

```bash
# 1. Abrir la página
agent-browser open https://ejemplo.com

# 2. Obtener snapshot interactivo con referencias (@e1, @e2...)
agent-browser snapshot -i

# 3. Interactuar con elementos
agent-browser click @e1
agent-browser fill @e2 "texto o credencial"
agent-browser press Enter

# 4. Capturar pantalla para auditoría visual
agent-browser screenshot review.png

# 5. Esperar cambios de estado
agent-browser wait --load
agent-browser wait --text "Texto esperado"

# 6. Cerrar sesión al terminar
agent-browser close
```

## Credenciales y Autenticación
- Si la web muestra formulario de login y no se dispone de credenciales: **preguntar inmediatamente al usuario**.
- Tras recibir las credenciales:
  ```bash
  agent-browser fill @eInputUsuario "usuario"
  agent-browser fill @eInputPassword "contraseña"
  agent-browser click @eBotonLogin
  agent-browser wait --load
  agent-browser snapshot -i
  ```
- Opcionalmente guardar estado de sesión:
  ```bash
  agent-browser state save ./auth-session.json
  agent-browser --state ./auth-session.json open https://app.ejemplo.com/dashboard
  ```

## Referencias
- `references/commands.md`: Catálogo completo de comandos.
- `references/authentication.md`: Patrones de autenticación, OAuth, cookies y 2FA.
- CLI dinámica: `agent-browser skills get core --full`

