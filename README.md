# Score App - Client (Frontend)

**Status:** ✅ **100% COMPLETADO** - Todos los 19 endpoints backend implementados

**Framework:** Next.js 14.2.25 (App Router)  
**Última actualización:** November 10, 2025

---

## 🎯 Descripción del Proyecto

Score App Client es una aplicación Next.js moderna para gestionar torneos deportivos con las siguientes funcionalidades:

- ✅ Autenticación de usuarios (login/register)
- ✅ Gestión de torneos (crear, editar, eliminar)
- ✅ Gestión de equipos (crear, editar, eliminar)
- ✅ Programación de partidos (crear, actualizar estado, eliminar)
- ✅ Gestión de jugadores (registrar, editar, eliminar)
- ✅ Perfil de usuario (ver y editar información)

---

## 🚀 Quick Start

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Backend API corriendo en `http://localhost:4000`

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Crear archivo .env.local con:
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

---

## 📊 Cobertura de Endpoints (100%)

```
USER ENDPOINTS (3/3)
✅ POST   /user/register    - Crear cuenta
✅ POST   /user/login       - Autenticarse
✅ PUT    /user/profile     - Editar perfil

TOURNAMENT ENDPOINTS (4/4)
✅ GET    /tournaments      - Listar torneos
✅ POST   /tournaments      - Crear torneo
✅ PUT    /tournaments/:id  - Editar torneo
✅ DELETE /tournaments/:id  - Eliminar torneo

TEAM ENDPOINTS (4/4)
✅ GET    /teams            - Listar equipos
✅ POST   /teams            - Crear equipo
✅ PUT    /teams/:id        - Editar equipo
✅ DELETE /teams/:id        - Eliminar equipo

MATCH ENDPOINTS (4/4)
✅ GET    /matches          - Listar partidos
✅ POST   /matches          - Crear partido
✅ PUT    /matches/:id      - Actualizar partido
✅ DELETE /matches/:id      - Eliminar partido

PLAYER ENDPOINTS (4/4)
✅ GET    /players          - Listar jugadores
✅ POST   /players          - Crear jugador
✅ PUT    /players/:id      - Editar jugador
✅ DELETE /players/:id      - Eliminar jugador

TOTAL: 19/19 endpoints (100%) ✨
```

---

## 🗂️ Estructura del Proyecto

```
app/
├── page.tsx                          # Home
├── organizer/
│   ├── login/page.tsx               # Login
│   ├── register/page.tsx            # Registro
│   ├── profile/page.tsx             # Perfil (NEW - FASE 4)
│   └── dashboard/
│       ├── page.tsx                 # Dashboard
│       ├── create/page.tsx          # Crear torneo
│       ├── teams/page.tsx           # Gestionar equipos
│       ├── matches/page.tsx         # Gestionar partidos
│       └── players/page.tsx         # Gestionar jugadores
└── tournaments/
    ├── page.tsx                     # Lista de torneos
    └── [id]/page.tsx                # Detalle de torneo

components/
├── navigation.tsx                    # Navegación principal
├── theme-provider.tsx               # Dark/Light mode
├── theme-toggle.tsx                 # Toggle tema
└── ui/                              # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── select.tsx
    ├── badge.tsx
    ├── calendar.tsx
    ├── popover.tsx
    └── ... (más componentes)

lib/
├── types.ts                         # Type definitions
└── utils.ts                         # Utility functions

hooks/
└── use-toast.ts                     # Toast notifications
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

**Nota:** Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente.

---

## 📚 Documentación

Para más detalles, consulta los siguientes archivos:

- **[README_COMPLETION.md](.github/doc/README_COMPLETION.md)** - Resumen ejecutivo del proyecto completado
- **[PROJECT_COMPLETION.md](.github/doc/PROJECT_COMPLETION.md)** - Documentación completa del proyecto
- **[API_DOCUMENTATION.md](.github/doc/API_DOCUMENTATION.md)** - Especificación de endpoints API
- **[TASK_INVENTORY.md](.github/doc/TASK_INVENTORY.md)** - Inventario y progreso de tareas
- **[PHASE1_SUMMARY.md](.github/doc/PHASE1_SUMMARY.md)** - Detalles FASE 1
- **[PHASE2_SUMMARY.md](.github/doc/PHASE2_SUMMARY.md)** - Detalles FASE 2
- **[PHASE3_SUMMARY.md](.github/doc/PHASE3_SUMMARY.md)** - Detalles FASE 3
- **[PHASE4_SUMMARY.md](.github/doc/PHASE4_SUMMARY.md)** - Detalles FASE 4
- **[copilot-instructions.md](.github/copilot-instructions.md)** - Guía arquitectónica

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build y producción
npm run build            # Build optimizada
npm run start            # Inicia servidor de producción

# Linting
npm run lint             # Verifica ESLint

# Type checking
npx tsc --noEmit        # Verifica TypeScript sin compilar
```

---

## 🏛️ Tecnologías Utilizadas

- **Next.js 14.2.25** - React framework con App Router
- **React 19.x** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3.4.0** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI)
- **Axios 1.12.2** - HTTP client
- **lucide-react** - Icon library
- **date-fns** - Date utilities

---

## 🔐 Autenticación

La aplicación usa JWT (JSON Web Tokens) para autenticación:

1. **Register**: POST `/user/register` → Crear cuenta → Recibir token
2. **Login**: POST `/user/login` → Autenticarse → Guardar token en localStorage
3. **Protected Routes**: Usar token en header `Authorization: Bearer <token>`

El token se almacena en `localStorage` y se incluye automáticamente en todas las peticiones.

**Auto-logout**: Si el token es inválido (401), la app redirige automáticamente a login.

---

## 🎨 Design System

### Colors
- **Primary**: Blue accent
- **Secondary**: Neutral gray
- **Success**: Green
- **Destructive**: Red

### Components
- **Card**: Glass effect (frosted glass)
- **Button**: Multiple variants (default, outline, ghost, destructive)
- **Input**: Form inputs con validación
- **Dialog**: Modal windows
- **Badge**: Status indicators
- **Toast**: Notifications

### Responsive Design
- Mobile-first approach
- Flexbox & Grid layouts
- Touch-friendly tap targets
- Adaptive typography

---

## ✨ Características Principales

### Autenticación
- ✅ Registro de nuevos usuarios
- ✅ Login con email/password
- ✅ JWT token management
- ✅ Auto-logout en sesión inválida
- ✅ Perfil de usuario editable

### Gestión de Torneos
- ✅ Crear torneos con banner personalizado
- ✅ Editar información del torneo
- ✅ Eliminar torneos
- ✅ Ver detalles públicos
- ✅ Filtrar y buscar

### Gestión de Equipos
- ✅ Crear equipos por torneo
- ✅ Cargar logo del equipo
- ✅ Editar información del equipo
- ✅ Eliminar equipos
- ✅ Asignar grupo/division

### Programación de Partidos
- ✅ Crear partidos (fecha, hora, equipos)
- ✅ Cambiar estado (pending → live → finished)
- ✅ Actualizar scores en tiempo real
- ✅ Eliminar partidos
- ✅ Ver historial de partidos

### Gestión de Jugadores
- ✅ Registrar jugadores (nombre, número, posición)
- ✅ Capturar datos biométricos (altura, peso)
- ✅ Fecha de nacimiento y nacionalidad
- ✅ Editar información del jugador
- ✅ Eliminar jugadores
- ✅ Validaciones automáticas

### Interfaz de Usuario
- ✅ Loading states (spinners)
- ✅ Error handling (toast notifications)
- ✅ Empty states (mensajes contextuales)
- ✅ Search & filtering
- ✅ Confirmation dialogs
- ✅ Dark/Light mode
- ✅ Responsive design

---

## 🧪 Testing

El proyecto está listo para testing. Para agregar tests:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Crear archivo jest.config.js
# Crear archivos *.test.tsx
# Correr tests
npm test
```

---

## 📈 Rendimiento

- ✅ Code splitting automático con Next.js
- ✅ Image optimization con Next.js Image
- ✅ Dynamic imports cuando es necesario
- ✅ Lazy loading de componentes
- ✅ CSS optimizado con Tailwind

---

## 🐛 Troubleshooting

### API Connection Error
```
Error: Cannot reach http://localhost:4000
```
**Solución:** Asegurate que el backend API está corriendo en `localhost:4000`

### Token Invalid / Session Expired
```
Status 401: Unauthorized
```
**Solución:** Haz login nuevamente. El token expirado redirige automáticamente a login.

### Image Not Displaying
```
Error: Image is missing required "src" property
```
**Solución:** Las imágenes externas deben estar configuradas en `next.config.mjs` bajo `remotePatterns`

### Port Already in Use
```
Error: Port 3000 already in use
```
**Solución:** `npm run dev -- -p 3001` (usar otro puerto)

---

## 📞 Contacto & Soporte

Para más información sobre arquitectura y guidelines, ver:
- `.github/copilot-instructions.md` - Arquitectura y patrones
- `.github/doc/` - Documentación detallada

---

## 📄 Licencia

Este proyecto es parte de Score App - Sistema de Gestión de Torneos Deportivos.

---

**Status:** ✅ **100% COMPLETADO**  
**Última actualización:** November 10, 2025  
**Listo para:** Producción, Testing, Escalabilidad

🎉 **¡Proyecto funcional y listo para despliegue!** 🎉
This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
