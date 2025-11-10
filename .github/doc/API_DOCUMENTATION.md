# 📚 API DOCUMENTATION - Score App Backend
**Versión:** 1.0  
**Base URL:** `http://localhost:4000/api/v1/`  
**Auth:** JWT Bearer Token en header `Authorization: Bearer <token>`  
**Última actualización:** November 10, 2025

---

## 🔐 AUTENTICACIÓN

### POST `/user/register`
Crear nueva cuenta usuario

**Auth requerida:** ❌ NO

**Request:**
```json
{
  "name": "string (2-100 chars, requerido)",
  "email": "string (valid email, unique, requerido)",
  "password": "string (6+ chars, requerido)",
  "organization": "string (0-100 chars, opcional)",
  "phoneNumber": "string (formato internacional, opcional)",
  "experience": "string (0-100 chars, opcional)"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "ObjectId",
    "name": "string",
    "email": "string"
  },
  "token": "JWT string"
}
```

**Errores:**
- `400 Bad Request` - Validación fallida o email ya existe

---

### POST `/user/login`
Autenticarse y obtener JWT token

**Auth requerida:** ❌ NO

**Request:**
```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "ObjectId",
    "name": "string",
    "email": "string"
  },
  "token": "JWT string (válido por 24h)"
}
```

**Errores:**
- `400 Bad Request` - Email o password no válidos
- `401 Unauthorized` - Credenciales incorrectas

---

### POST `/user/verify`
Verificar que el token actual es válido

**Auth requerida:** ✅ SÍ (Bearer token)

**Response:** `200 OK`
```json
{
  "valid": true,
  "user": {
    "id": "ObjectId",
    "name": "string",
    "email": "string"
  }
}
```

**Errores:**
- `401 Unauthorized` - Token faltante, inválido o expirado

---

### PUT `/user/profile` (NUEVO)
Actualizar perfil del usuario autenticado

**Auth requerida:** ✅ SÍ (Bearer token)

**Request (todos los campos opcionales):**
```json
{
  "name": "string (2-100 chars)",
  "organization": "string (0-100 chars)",
  "phoneNumber": "string (formato internacional)",
  "experience": "string (0-100 chars)"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "ObjectId",
    "name": "string",
    "email": "string",
    "organization": "string",
    "phoneNumber": "string",
    "experience": "string"
  }
}
```

**Errores:**
- `401 Unauthorized` - Token inválido
- `400 Bad Request` - Validación fallida

---

## 🏆 TOURNAMENTS

### GET `/tournaments`
Listar todos los torneos (públicos)

**Auth requerida:** ❌ NO

**Response:** `200 OK`
```json
{
  "tournaments": [
    {
      "id": "ObjectId",
      "name": "string",
      "description": "string",
      "sportType": "soccer|basketball|volleyball|tennis|rugby",
      "tournamentFormat": "league|knockout|hybrid",
      "status": "upcoming|inprogress|finished",
      "numberOfParticipants": "number",
      "pointsForWin": "number",
      "pointsForDraw": "number",
      "pointsForLoss": "number",
      "createdBy": "ObjectId",
      "tournamentBanner": "string (/uploads/tournaments/...)",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

---

### GET `/tournaments/:id`
Obtener detalles de un torneo específico

**Auth requerida:** ❌ NO

**Response:** `200 OK` (mismo objeto que GET /tournaments)

**Errores:**
- `404 Not Found` - Torneo no existe

---

### GET `/tournaments/:id/standings`
Obtener tabla de posiciones (solo formato league)

**Auth requerida:** ❌ NO

**Response:** `200 OK`
```json
{
  "standings": [
    {
      "position": "number",
      "team": {
        "id": "ObjectId",
        "name": "string",
        "teamLogo": "string (/uploads/teams/...)",
        "group": "string"
      },
      "played": "number",
      "won": "number",
      "drawn": "number",
      "lost": "number",
      "goalsFor": "number",
      "goalsAgainst": "number",
      "goalDifference": "number",
      "points": "number"
    }
  ]
}
```

---

### POST `/tournaments`
Crear nuevo torneo

**Auth requerida:** ✅ SÍ (Bearer token)

**Content-Type:** `multipart/form-data` o `application/json`

**Request:**
```json
{
  "name": "string (3-100 chars, requerido)",
  "description": "string (opcional)",
  "sportType": "soccer|basketball|volleyball|tennis|rugby (requerido)",
  "tournamentFormat": "league|knockout|hybrid (requerido)",
  "numberOfParticipants": "number (2-1000, requerido)",
  "pointsForWin": "number (default 3)",
  "pointsForDraw": "number (default 1)",
  "pointsForLoss": "number (default 0)"
}
```

**File (opcional):**
- Field: `tournamentBanner`
- Types: jpeg, jpg, png, gif, webp
- Max: 5MB

**Response:** `201 Created`

**Errores:**
- `400 Bad Request` - Validación fallida
- `401 Unauthorized` - Token inválido
- `413 Payload Too Large` - Archivo > 5MB

---

### PUT `/tournaments/:id`
Actualizar torneo (solo creador)

**Auth requerida:** ✅ SÍ (Bearer token)

**Request:** Mismos campos de POST, todos opcionales

**Response:** `200 OK` (objeto torneo actualizado)

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador
- `404 Not Found` - Torneo no existe
- `400 Bad Request` - Validación fallida

---

### DELETE `/tournaments/:id`
Eliminar torneo (solo creador)

**Auth requerida:** ✅ SÍ (Bearer token)

**Response:** `200 OK`
```json
{
  "message": "Torneo eliminado exitosamente"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador
- `404 Not Found` - Torneo no existe

---

### GET `/tournaments/my-tournaments` (OPCIONAL)
Obtener solo los torneos creados por el usuario

**Auth requerida:** ✅ SÍ (Bearer token)

**Response:** `200 OK` (array de torneos del usuario)

---

## 👥 TEAMS

### GET `/teams`
Listar todos los equipos

**Auth requerida:** ❌ NO

**Query parameters:**
- `tournament` = ObjectId (opcional)

**Response:** `200 OK`
```json
{
  "teams": [
    {
      "id": "ObjectId",
      "name": "string",
      "tournament": "ObjectId",
      "group": "string",
      "teamLogo": "string (/uploads/teams/...)",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

---

### GET `/teams/:id`
Obtener detalles de un equipo

**Auth requerida:** ❌ NO

**Response:** `200 OK` (objeto equipo)

**Errores:**
- `404 Not Found` - Equipo no existe

---

### POST `/teams`
Crear nuevo equipo (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Content-Type:** `multipart/form-data` o `application/json`

**Request:**
```json
{
  "name": "string (2-100 chars, requerido)",
  "tournament": "ObjectId (requerido)",
  "group": "string (0-50 chars, opcional)"
}
```

**File (opcional):**
- Field: `teamLogo`
- Types: jpeg, jpg, png, gif, webp
- Max: 5MB

**Response:** `201 Created`

**Errores:**
- `400 Bad Request` - Validación fallida
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo

---

### PUT `/teams/:id`
Actualizar equipo (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Request:** Mismos campos de POST, todos opcionales

**Response:** `200 OK`

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo
- `404 Not Found` - Equipo no existe

---

### DELETE `/teams/:id`
Eliminar equipo (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Response:** `200 OK`
```json
{
  "message": "Equipo eliminado exitosamente"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo
- `404 Not Found` - Equipo no existe

---

## ⚽ MATCHES

### GET `/matches`
Listar todos los partidos

**Auth requerida:** ❌ NO

**Query parameters:**
- `tournament` = ObjectId (opcional)

**Response:** `200 OK`
```json
{
  "matches": [
    {
      "id": "ObjectId",
      "tournament": "ObjectId",
      "homeTeam": {
        "id": "ObjectId",
        "name": "string"
      },
      "awayTeam": {
        "id": "ObjectId",
        "name": "string"
      },
      "homeTeamScore": "number (default 0)",
      "awayTeamScore": "number (default 0)",
      "status": "scheduled|playing|completed",
      "matchDate": "ISO 8601",
      "matchTime": "HH:MM",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

---

### GET `/matches/:id`
Obtener detalles de un partido

**Auth requerida:** ❌ NO

**Response:** `200 OK` (objeto partido)

**Errores:**
- `404 Not Found` - Partido no existe

---

### POST `/matches`
Crear nuevo partido (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Request:**
```json
{
  "tournament": "ObjectId (requerido)",
  "homeTeam": "ObjectId (requerido)",
  "awayTeam": "ObjectId (requerido, diferente de homeTeam)",
  "matchDate": "ISO 8601 (requerido)",
  "matchTime": "HH:MM (requerido)",
  "status": "scheduled|playing|completed (default scheduled)"
}
```

**Response:** `201 Created`

**Errores:**
- `400 Bad Request` - Validación fallida o equipos iguales
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo

---

### PUT `/matches/:id`
Actualizar partido (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Request (todos opcionales):**
```json
{
  "homeTeamScore": "number",
  "awayTeamScore": "number",
  "status": "scheduled|playing|completed",
  "matchDate": "ISO 8601",
  "matchTime": "HH:MM"
}
```

**Response:** `200 OK`

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo
- `404 Not Found` - Partido no existe

---

### DELETE `/matches/:id`
Eliminar partido (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Response:** `200 OK`
```json
{
  "message": "Partido eliminado exitosamente"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo
- `404 Not Found` - Partido no existe

---

## 🎮 PLAYERS

### GET `/players`
Listar todos los jugadores

**Auth requerida:** ❌ NO

**Query parameters:**
- `team` = ObjectId (opcional)

**Response:** `200 OK`
```json
{
  "players": [
    {
      "id": "ObjectId",
      "name": "string",
      "number": "number (0-99)",
      "position": "string",
      "team": "ObjectId",
      "height": "number (50-300 cm)",
      "weight": "number (20-200 kg)",
      "dateOfBirth": "YYYY-MM-DD",
      "nationality": "string",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

---

### GET `/players/:id`
Obtener detalles de un jugador

**Auth requerida:** ❌ NO

**Response:** `200 OK` (objeto jugador)

**Errores:**
- `404 Not Found` - Jugador no existe

---

### POST `/players`
Crear nuevo jugador (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Request:**
```json
{
  "name": "string (2-100 chars, requerido)",
  "number": "number (0-99, requerido)",
  "position": "string (1-50 chars, requerido)",
  "team": "ObjectId (requerido)",
  "height": "number (50-300 cm, requerido)",
  "weight": "number (20-200 kg, requerido)",
  "dateOfBirth": "YYYY-MM-DD (requerido, debe ser en el pasado)",
  "nationality": "string (requerido)"
}
```

**Response:** `201 Created`

**Errores:**
- `400 Bad Request` - Validación fallida
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo

---

### PUT `/players/:id`
Actualizar jugador (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Request:** Mismos campos de POST, todos opcionales

**Response:** `200 OK`

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo
- `404 Not Found` - Jugador no existe

---

### DELETE `/players/:id`
Eliminar jugador (solo creador del torneo)

**Auth requerida:** ✅ SÍ (Bearer token)

**Response:** `200 OK`
```json
{
  "message": "Jugador eliminado exitosamente"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No eres el creador del torneo
- `404 Not Found` - Jugador no existe

---

## 🔒 MATRIZ DE AUTORIZACIÓN

| Recurso | GET | POST | PUT | DELETE | Nota |
|---------|-----|------|-----|--------|------|
| User | Public | Public | ✅ Auth | - | Solo verif requiere auth |
| Tournament | Public | ✅ Auth | ✅ Owner | ✅ Owner | Owner = creador |
| Team | Public | ✅ Owner | ✅ Owner | ✅ Owner | Owner = creador torneo |
| Match | Public | ✅ Owner | ✅ Owner | ✅ Owner | Owner = creador torneo |
| Player | Public | ✅ Owner | ✅ Owner | ✅ Owner | Owner = creador torneo |

---

## 🎯 NOTAS IMPORTANTES

### Autorización (403 Forbidden)
Cuando intentas actualizar/eliminar un recurso que no creaste:
```json
{
  "message": "No tienes permiso para realizar esta acción"
}
```

### Validación (400 Bad Request)
Si los datos no cumplen las reglas:
```json
{
  "message": "Error de validación",
  "errors": {
    "fieldName": "Descripción del error en español"
  }
}
```

### Archivos (File Uploads)
- Tournament Banner: Field `tournamentBanner`, max 5MB, tipos: jpeg, jpg, png, gif, webp
- Team Logo: Field `teamLogo`, max 5MB, tipos: jpeg, jpg, png, gif, webp
- Acceso: `http://localhost:4000` + la ruta retornada (ej: `/uploads/teams/...`)

### Tokens JWT
- Obtenidos: POST `/user/register` o POST `/user/login`
- Validez: 24 horas
- Uso: Header `Authorization: Bearer <token>`
- Expiración: Retorna 401 si está vencido

---

**Última actualización:** November 10, 2025  
**Generado para:** Next.js Frontend Development
