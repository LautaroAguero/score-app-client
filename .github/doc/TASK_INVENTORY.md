# 📋 INVENTARIO DE TAREAS - Score App Client
**Fecha creación:** November 10, 2025  
**Estado:** PLANIFICACIÓN  
**Objetivo:** Implementación 100% de endpoints backend con UI/UX consistente

---

## 📊 VISTA GENERAL DE COBERTURA

```
MÓDULO          | GET | POST | PUT | DELETE | TOTAL | STATUS
────────────────────────────────────────────────────────────────
USER            | ✅  | ✅   | ✅  | -      | 3/3   | 100%
TOURNAMENT      | ✅  | ✅   | ✅  | ✅     | 4/4   | 100%
TEAM            | ✅  | ✅   | ✅  | ✅     | 4/4   | 100%
MATCH           | ✅  | ✅   | ✅  | ✅     | 4/4   | 100%
PLAYER          | ✅  | ✅   | ✅  | ✅     | 4/4   | 100%
────────────────────────────────────────────────────────────────
COBERTURA TOTAL:                            19/19 | 100% ✨
```

---

## 🔐 MÓDULO: USER (USUARIO)

### Estado Actual: 100% (3/3 endpoints) ✨ COMPLETADO

#### ✅ IMPLEMENTADO
- [x] **POST `/user/register`** - Registrar nuevo usuario
  - **Ubicación página**: `app/organizer/register/page.tsx`
  - **Funcionalidad**: Crear cuenta nueva con validación
  - **Status**: ✅ OPERATIVO

- [x] **POST `/user/login`** - Autenticarse
  - **Ubicación página**: `app/organizer/login/page.tsx`
  - **Funcionalidad**: Login con email/password, genera JWT token
  - **Status**: ✅ OPERATIVO

- [x] **PUT `/user/profile`** - Actualizar perfil del usuario
  - **Ubicación página**: `app/organizer/profile/page.tsx` (NUEVA - FASE 4)
  - **Funcionalidad**: Ver y editar nombre, organización, teléfono, experiencia
  - **Campos editables**: name, organization, phoneNumber, experience
  - **Campos no editables**: email, id (solo lectura)
  - **Validación**: 
    - Name: 2-100 caracteres, requerido
    - Organization: 0-100 caracteres, opcional
    - Phone: formato internacional, opcional
    - Experience: 0-100 caracteres, opcional
  - **Características**:
    - GET /user/profile para cargar datos actuales
    - Modal edit/view
    - Toast notifications para success/error
    - Session management (logout si token inválido)
    - Display de datos en cards con iconos
  - **Status**: ✅ IMPLEMENTADO FASE 4

---

## 🏆 MÓDULO: TOURNAMENT (TORNEO)

### Estado Actual: 100% (4/4 endpoints)

#### ✅ IMPLEMENTADO
- [x] GET `/tournaments` - Listar todos los torneos
  - **Ubicación**: `app/tournaments/page.tsx`
  - **Status**: Funcional, datos en vivo

- [x] GET `/tournaments/:id` - Detalle de torneo
  - **Ubicación**: `app/tournaments/[id]/page.tsx`
  - **Status**: Funcional con standings implementados

- [x] GET `/tournaments/:id/standings` - Tabla de posiciones
  - **Ubicación**: Dentro de `app/tournaments/[id]/page.tsx`
  - **Status**: Implementado con datos reales

- [x] POST `/tournaments` - Crear nuevo torneo
  - **Ubicación**: `app/organizer/dashboard/create/page.tsx`
  - **Status**: Funcional, incluye upload de banner

- [x] **PUT `/tournaments/:id` - Editar torneo** ✨ NUEVA
  - **Ubicación página**: `app/tournaments/[id]/edit/page.tsx`
  - **Campos editables**: name, description, sportType, tournamentFormat, numberOfParticipants, pointsForWin/Draw/Loss, tournamentBanner
  - **Validación**: Completa con FormData
  - **Restricción**: Solo creador puede editar
  - **UI/UX**: Botón "Edit" en tarjeta de torneo en dashboard
  - **Status**: ✅ IMPLEMENTADO - FormData con headers multipart/form-data

- [x] **DELETE `/tournaments/:id` - Eliminar torneo** ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/page.tsx` (dropdown menu)
  - **Confirmación**: Dialog con advertencia sobre eliminación
  - **Restricción**: Solo creador puede eliminar
  - **UI/UX**: Botón "Delete" en dropdown menu con icono de papelera
  - **Status**: ✅ IMPLEMENTADO - Con manejo de errores y refresh de lista

---

## 👥 MÓDULO: TEAM (EQUIPO)

### Estado Actual: 100% (4/4 endpoints)

#### ✅ IMPLEMENTADO
- [x] GET `/teams` (con filtro por torneo)
  - **Ubicación**: `app/organizer/dashboard/teams/page.tsx`
  - **Status**: Funcional, filtra por torneo con query params

- [x] POST `/teams` - Crear equipo
  - **Ubicación**: `app/organizer/dashboard/teams/page.tsx` (modal)
  - **Status**: Funcional, incluye upload de logo

- [x] **PUT `/teams/:id` - Editar equipo** ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/teams/page.tsx` (modal edit)
  - **Modal/Dialog**: Reutiliza form de creación con datos precargados
  - **Campos editables**: name, group, teamLogo
  - **Validación**: FormData con multipart/form-data headers
  - **Restricción**: Solo creador del torneo puede editar
  - **UI/UX**: Botón "Edit" en cada equipo + preview de logo existente
  - **Status**: ✅ IMPLEMENTADO - Manejo correcto de FormData field names

- [x] **DELETE `/teams/:id` - Eliminar equipo** ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/teams/page.tsx` (dialog)
  - **Confirmación**: Dialog con advertencia
  - **Restricción**: Solo creador del torneo
  - **UI/UX**: Botón "Delete" con icono en cada equipo
  - **Status**: ✅ IMPLEMENTADO - Con confirmación y refresh automático

---

## ⚽ MÓDULO: MATCH (PARTIDO)

### Estado Actual: 100% (4/4 endpoints) ✨ COMPLETADO

#### ✅ IMPLEMENTADO

- [x] **GET `/matches`** (con filtro por torneo) ✨
  - **Ubicación página**: `app/organizer/dashboard/matches/page.tsx`
  - **Query param**: `?tournament=ID` para filtrar
  - **Mostrar**: Lista de partidos del torneo seleccionado
  - **Estado**: scheduled, playing, completed (colores diferentes)
  - **Status**: ✅ IMPLEMENTADO

- [x] **POST `/matches`** - Crear partido ✨
  - **Ubicación página**: `app/organizer/dashboard/matches/page.tsx` (modal)
  - **Campos requeridos**: tournament, homeTeam, awayTeam, matchDate, matchTime
  - **Validación**: Campos requeridos verificados
  - **UI/UX**: Dialog con selectores de equipos, date picker y time picker
  - **Status**: ✅ IMPLEMENTADO - handleAddMatch funcional

- [x] **PUT `/matches/:id`** - Actualizar partido ✨
  - **Ubicación página**: Modal inline edit en lista de partidos
  - **Casos de uso**:
    - Cambiar status: scheduled → playing → completed (handleStartMatch, handleEndMatch)
    - Actualizar scores: homeTeamScore, awayTeamScore (handleUpdateScore)
  - **Validación**: Scores >= 0
  - **UI/UX**: Botones "Start Match", "Update Score", "End Match"
  - **Status**: ✅ IMPLEMENTADO - Tres handlers funcionales

- [x] **DELETE `/matches/:id`** - Eliminar partido ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/matches/page.tsx`
  - **Confirmación**: Dialog con advertencia clara
  - **UI/UX**: Botón "Delete" con icono papelera en cada partido
  - **Status**: ✅ IMPLEMENTADO - handleDeleteClick, handleDeleteConfirm, handleDeleteCancel
  - **Características**:
    - Dialog de confirmación muestra equipos del partido
    - Actualización automática de lista después de eliminar
    - Toast notifications para éxito y error

---

## 🎮 MÓDULO: PLAYER (JUGADOR) - NUEVO

### Estado Actual: 100% (4/4 endpoints) ✨ COMPLETADO

#### ✅ IMPLEMENTADO

- [x] **GET `/players`** (con filtro por equipo) ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/players/page.tsx`
  - **Query param**: `?team=ID` para filtrar
  - **Funcionalidad**: 
    - Selector de torneo (filtra equipos disponibles)
    - Selector de equipo (filtra jugadores del equipo)
    - Búsqueda por nombre
  - **Status**: ✅ IMPLEMENTADO - fetchData con múltiples endpoints

- [x] **POST `/players`** - Crear jugador ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/players/page.tsx` (modal)
  - **Dialog**: "Add New Player"
  - **Campos**: name*, number* (0-99), position*, team*, height, weight, dateOfBirth, nationality
  - **Validación**: 
    - Campos requeridos
    - Número entre 0 y 99
  - **Selectores**: Team, Position
  - **Date picker**: Para dateOfBirth
  - **Status**: ✅ IMPLEMENTADO - handleAddPlayer con validación

- [x] **PUT `/players/:id`** - Editar jugador ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/players/page.tsx` (modal edit)
  - **Dialog**: "Edit Player"
  - **Campos editables**: name, number, position, height, weight, dateOfBirth, nationality
  - **No editable**: team (no se puede cambiar de equipo)
  - **Validación**: Igual a POST
  - **Status**: ✅ IMPLEMENTADO - handleEditPlayer con handleEditClick

- [x] **DELETE `/players/:id`** - Eliminar jugador ✨ NUEVA
  - **Ubicación página**: `app/organizer/dashboard/players/page.tsx`
  - **Confirmación**: Dialog mostrando nombre del jugador
  - **Botón**: "Delete" con icono Trash2 (rojo/destructive)
  - **Status**: ✅ IMPLEMENTADO - handleDeleteClick, handleDeleteConfirm, handleDeleteCancel
  - **Características**:
    - Dialog con advertencia clara
    - Refresh automático después de eliminar
    - Toast notifications para éxito y error

#### Características Especiales de la Página:
- Filtros dinámicos: Tournament → Team (actualiza automáticamente)
- Búsqueda en tiempo real por nombre
- Tarjetas de jugador con badge de posición
- Información adicional: altura, peso, nacionalidad, fecha de nacimiento
- Botones Edit y Delete en cada jugador
- Loading state con spinner
- Empty state con mensaje contextual

---

## 🎨 MEJORAS TRANSVERSALES (NO ESPECÍFICAS DE ENDPOINT)

### [ ] Validaciones con Zod
- **Ubicación**: `lib/validations.ts` (crear)
- **Schemas a crear**:
  - [ ] `userSchema` (name, email, password, organization, phoneNumber, experience)
  - [ ] `tournamentSchema` (name, description, sportType, tournamentFormat, numberOfParticipants, points)
  - [ ] `teamSchema` (name, tournament, group)
  - [ ] `matchSchema` (tournament, homeTeam, awayTeam, matchDate, matchTime, scores, status)
  - [ ] `playerSchema` (name, number, position, team, height, weight, dateOfBirth, nationality)
- **Beneficio**: Validación inmediata en cliente, mejor UX
- **Prioridad**: 🟡 MEDIA

### [ ] Manejo de Errores Centralizado
- **Ubicación**: `hooks/use-api-error.ts` (crear)
- **Funcionalidades**:
  - [ ] Mapear 400 → Errores de validación
  - [ ] Mapear 401 → Token expirado, redirigir a login
  - [ ] Mapear 403 → No tienes permiso para esta acción
  - [ ] Mapear 404 → Recurso no encontrado
  - [ ] Mapear 500 → Error del servidor
  - [ ] Mostrar toast automático para cada tipo de error
- **Beneficio**: Código más limpio, UX consistente
- **Prioridad**: 🟡 MEDIA

### [ ] Perfil de Usuario (GET + PUT)
- **Ubicación**: `app/organizer/profile/page.tsx` (nueva)
- **Funcionalidades**:
  - [ ] Mostrar datos actuales del usuario
  - [ ] Formulario para editar perfil (name, email, organization, phoneNumber, experience)
  - [ ] Ver token actual (para debugging)
  - [ ] Botón de logout
  - [ ] Mostrar torneos creados
  - [ ] Validación Zod
  - [ ] Error handling mejorado
- **Restricción**: Solo usuario autenticado
- **Prioridad**: 🟡 MEDIA

### [ ] Mejorar Página Dashboard Principal
- **Ubicación**: `app/organizer/dashboard/page.tsx`
- **Cambios**:
  - [ ] Agregar tabs o secciones para: Tournaments, Teams, Matches, Players
  - [ ] O crear páginas separadas: `dashboard/tournaments/`, `dashboard/teams/`, `dashboard/matches/`, `dashboard/players/`
  - [ ] Mostrar estadísticas generales (total torneos, total equipos, próximos partidos)
  - [ ] Quick access buttons
- **Prioridad**: 🟡 MEDIA

### [ ] Documentación API (NUEVA)
- **Ubicación**: `API_DOCUMENTATION.md` (crear en raíz)
- **Contenido**: Copiar toda la documentación del backend report
- **Beneficio**: Referencia centralizada, evita confusiones
- **Prioridad**: 🟢 BAJA (documentación, no feature)

---

## 📈 ORDEN DE EJECUCIÓN RECOMENDADO

### FASE 1: CORRECCIONES Y MEJORAS EXISTENTES (32% → 58%) ✅ COMPLETADA
1. ✅ **FASE 1.1 - MATCH GET** - Implementar lista de partidos en dashboard (37%)
2. ✅ **FASE 1.2 - TEAM PUT** - Editar equipo (42%)
3. ✅ **FASE 1.3 - TEAM DELETE** - Eliminar equipo (verificado, ya funciona)
4. ✅ **FASE 1.4 - TOURNAMENT PUT** - Editar torneo (verificado, ya funciona)
5. ✅ **FASE 1.5 - TOURNAMENT DELETE** - Eliminar torneo (verificado, ya funciona)

### FASE 2: CREAR NUEVA FUNCIONALIDAD (58% → 74%) ✅ COMPLETADA
6. ✅ **FASE 2.1 - MATCH POST** - Crear partido (implementado, handleAddMatch)
7. ✅ **FASE 2.2 - MATCH PUT** - Actualizar score y status (implementado, 3 handlers)
8. ✅ **FASE 2.3 - MATCH DELETE** - Eliminar partido (handleDeleteClick, dialog, confirmación)

### FASE 3: MÓDULO NUEVO (74% → 95%) ✅ COMPLETADA
9. ✅ **FASE 3.1 - PLAYER GET** - Listar jugadores (implementado con filtros)
10. ✅ **FASE 3.2 - PLAYER POST** - Crear jugador (implementado, handleAddPlayer)
11. ✅ **FASE 3.3 - PLAYER PUT** - Editar jugador (implementado, handleEditPlayer)
12. ✅ **FASE 3.4 - PLAYER DELETE** - Eliminar jugador (implementado, handleDeleteConfirm)

### FASE 4: PERFIL DE USUARIO (95% → 100%) ✅ COMPLETADA
13. ✅ **FASE 4.1 - PUT `/user/profile`** - Actualizar perfil del usuario
    - **Ubicación**: `app/organizer/profile/page.tsx` (NUEVA)
    - **Implementación completa**: GET /user/profile, PUT /user/profile
    - **Campos editables**: name, organization, phoneNumber, experience
    - **Características**: Edit mode, validation, session management, toast notifications
    - **Status**: ✅ IMPLEMENTADO - PROYECTO 100% COMPLETADO

---

## 🎯 PRIORIDADES RESUMIDAS

### 🔴 ALTA - COMPLETADO ✨
- [x] Tournament CRUD completo
- [x] Team CRUD completo
- [x] Match CRUD completo
- [x] Player CRUD completo
- [x] User Profile PUT completado

### MEDIA-ALTA
- [ ] Validaciones Zod centralizadas
- [ ] Error handling mejorado
- [ ] Perfil de usuario (PUT /user/profile)

### 🟡 MEDIA
- [ ] Dashboard mejorado con navegación
- [ ] GET /matches/:id (detalles de partido)
- [ ] GET /teams/:id (detalles de equipo)

### 🟢 BAJA
- [ ] Documentación API actualizada
- [ ] Estadísticas avanzadas
- [ ] Analytics dashboard

---

## 📝 ESTADOS Y LEYENDA

- ✅ = Implementado y funcional
- ❌ = No implementado, pendiente
- ❓ = Parcialmente implementado, requiere revisión
- 🔴 = Prioridad alta
- 🟠 = Prioridad media-alta
- 🟡 = Prioridad media
- 🟢 = Prioridad baja

---

## 📊 PROGRESO ACTUAL

**Fecha última actualización:** November 10, 2025  
**Cobertura actual:** 74% (14/19 endpoints) ⬆️ +42% desde inicio (32%)
**Próxima meta:** 100% (después de Fase 3)  
**Meta final:** 100% (19/19 endpoints)

---

## 🏆 LOGROS DE FASE 2

### Completados en FASE 2:
1. ✅ **FASE 2.1 - Match POST**
   - Ya estaba implementado: `handleAddMatch()`
   - Dialog con selectores de equipos, date picker y time picker
   - Validación de campos requeridos
   - Toast notifications

2. ✅ **FASE 2.2 - Match PUT**
   - Ya estaba implementado en 3 handlers diferentes:
     - `handleStartMatch()` - Cambiar status a "playing"
     - `handleUpdateScore()` - Actualizar scores
     - `handleEndMatch()` - Cambiar status a "completed"
   - Todas las acciones funcionan correctamente

3. ✅ **FASE 2.3 - Match DELETE** (NUEVA IMPLEMENTACIÓN)
   - `handleDeleteClick()` - Dispara el dialog de confirmación
   - `handleDeleteConfirm()` - Ejecuta la eliminación via axios.delete
   - `handleDeleteCancel()` - Cancela la operación
   - Dialog con advertencia clara mostrando equipos del partido
   - Botón delete en MatchCard
   - Refresh automático de lista

### Cambios Realizados:
- Agregados estados: `isDeleteDialogOpen`, `matchToDelete`, `isDeleting`
- Agregado handler `handleDeleteClick()`, `handleDeleteConfirm()`, `handleDeleteCancel()`
- Agregado Delete Dialog en template principal
- Actualizada firma de MatchCard para aceptar `onDeleteClick`
- Agregado botón Delete con ícono Trash2 en MatchCard
- Actualizado Trash2 en imports de lucide-react
- Actualizado todos los usos de MatchCard para pasar `onDeleteClick`

### Cobertura por Módulo:
- **Match**: 25% → 100% (1/4 → 4/4) ✨ +75%
- **Total**: 58% → 74% (11/19 → 14/19) ✨ +16%
