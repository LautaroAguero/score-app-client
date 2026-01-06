# Backend Requirements - Registration & Login Unificado

## 📋 Resumen General

El frontend ha implementado:
- ✅ Módulo de Registration (inscripción de equipos a torneos)
- ✅ Login Unificado con selección de rol

El backend necesita hacer cambios menores para soportar completamente estas funcionalidades.

---

## 🔐 1. Login Unificado - POST /user/register

### Cambio Necesario

**Aceptar campo `userRole` en el request:**

```json
{
  "name": "Juan García",
  "email": "juan@example.com",
  "password": "password123",
  "userRole": "team-captain" | "organizer",
  "organization": "Mi Org (opcional)",
  "phone": "+1234567890 (opcional)",
  "experience": "Texto (opcional)"
}
```

### Implementación

- ✅ Aceptar el campo `userRole` (string: "team-captain" o "organizer")
- ✅ Guardarlo en el usuario si la BD lo permite (para uso futuro)
- ✅ **NO es obligatorio** - si no se envía, crear usuario normalmente
- ✅ Responder con token como actualmente

### Notas

- Si no envía `userRole`, el sistema funciona igual (por compatibilidad)
- El rol se usa principalmente en el frontend para definir qué puede hacer
- Futuro: Validar en backend que solo "organizador" cree torneos, solo "team-captain" cree equipos

---

## 📋 2. Registration Module - Validaciones Backend

### Endpoints Existentes ✅

Estos ya están implementados según documentación:

```
POST   /registrations                          ✅
GET    /registrations/my-registrations         ✅
GET    /registrations/tournament/:id           ✅
GET    /registrations/tournament/:id/stats     ✅
PATCH  /registrations/:id/approve             ✅
PATCH  /registrations/:id/reject              ✅
DELETE /registrations/:id                     ✅
```

### Validaciones Críticas Necesarias ✅

Confirmar que están implementadas:

#### 1. **POST /registrations** 
```javascript
// Validar
- El equipo existe y pertenece al torneo
- El usuario autenticado es dueño del equipo
- No hay inscripción duplicada (índice único)
- Período de inscripción (si aplica)
- Límite de cupos (si hay maxTeams)
- Si requiresApproval=false → status="approved"
- Si requiresApproval=true → status="pending"
```

#### 2. **PATCH /registrations/:id/approve**
```javascript
// Validar
- Solo tournament.createdBy puede aprobar
- No exceder maxTeams
- Cambiar status a "approved"
- Registrar approvedBy y approvedAt
```

#### 3. **PATCH /registrations/:id/reject**
```javascript
// Validar
- Solo tournament.createdBy puede rechazar
- Cambiar status a "rejected"
- Guardar rejectionReason (opcional)
- Registrar quién rechazó
```

#### 4. **DELETE /registrations/:id**
```javascript
// Validar
- Solo registration.user puede cancelar (Bearer token)
- No puede cancelar si status="rejected"
- Eliminar permanentemente (no soft-delete)
```

#### 5. **GET /registrations/my-registrations**
```javascript
// Retornar
- Solo las inscripciones donde user===autenticado
- Incluir datos del torneo (nombre, sport, estado)
- Incluir datos del equipo (nombre, logo)
```

---

## 🔗 3. Relaciones Necesarias

### Team Model
Confirmar que tiene:
```typescript
{
  _id: ObjectId,
  name: string,
  tournament: { _id, name },
  createdBy: ObjectId,  // ← Usuario que creó el equipo
  teamLogo?: string,
  group?: string
}
```

### Tournament Model
Confirmar que tiene:
```typescript
{
  _id: ObjectId,
  name: string,
  createdBy: { _id, name, email },  // ← Organizador
  maxTeams?: number,
  requiresApproval?: boolean,
  registrationStartDate?: Date,
  registrationEndDate?: Date,
  // ... otros campos
}
```

### Registration Model
Confirmar que tiene:
```typescript
{
  _id: ObjectId,
  tournament: { _id, name, sportType },
  team: { _id, name, teamLogo },
  user: { _id, name, email },
  approvedBy?: { _id, name, email },
  status: "pending" | "approved" | "rejected",
  appliedAt: Date,
  approvedAt?: Date,
  rejectionReason?: string,
  createdAt: Date,
  updatedAt: Date,
  
  // ← Índice único: { tournament, team }
}
```

---

## 📊 4. Índices Recomendados

```javascript
// Registration
db.registrations.createIndex({ tournament: 1, team: 1 }, { unique: true })
db.registrations.createIndex({ user: 1 })
db.registrations.createIndex({ tournament: 1, status: 1 })

// Team
db.teams.createIndex({ tournament: 1, createdBy: 1 })

// Tournament
db.tournaments.createIndex({ createdBy: 1 })
```

---

## ✅ 5. Checklist Backend

- [ ] POST /user/register acepta `userRole`
- [ ] POST /registrations valida período de inscripción
- [ ] POST /registrations valida límite de cupos
- [ ] PATCH approve/reject valida permisos (createdBy)
- [ ] DELETE /registrations/:id valida permisos (user)
- [ ] GET /my-registrations filtra por usuario autenticado
- [ ] Índice único {tournament, team} en registrations
- [ ] Respuestas incluyen todos los campos documentados
- [ ] Manejo de errores con códigos HTTP correctos:
  - 400 = Validación fallida
  - 403 = Sin permiso
  - 404 = No encontrado
  - 409 = Conflicto (duplicado)

---

## 📝 Notas Finales

### Lo que SÍ está listo:
- ✅ Frontend completo (login, register, registration module)
- ✅ Componentes y páginas
- ✅ Validaciones UX

### Lo que necesita backend:
- ⚠️ Soportar `userRole` en registro (cambio menor)
- ⚠️ Confirmar todas las validaciones de Registration
- ⚠️ Confirmar índices y relaciones

### Dependencias:
- Backend debe devolver estructura exacta de Registration (documentada)
- Frontend espera campos específicos en respuestas

---

## 🚀 Testing Recomendado

```bash
# Crear usuario como team-captain
POST /user/register
{
  "name": "Juan",
  "email": "juan@test.com",
  "password": "test123",
  "userRole": "team-captain"
}

# Crear usuario como organizador
POST /user/register
{
  "name": "Admin",
  "email": "admin@test.com", 
  "password": "test123",
  "userRole": "organizer"
}

# Team-captain crea equipo
POST /teams
{ "name": "Mi Equipo", "tournament": "..." }

# Team-captain se inscribe
POST /registrations
{ "tournament": "...", "team": "..." }

# Organizador aprueba
PATCH /registrations/[id]/approve

# Team-captain ve sus inscripciones
GET /registrations/my-registrations
```

---

**Cualquier duda sobre los requerimientos, pregunta sin dudar.** ✅
