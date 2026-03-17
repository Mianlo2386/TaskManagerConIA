# Especificación (Spec First) – API REST de Tareas

**Proyecto:** Task Manager (AI-First)  
**Referencia:** [agent.md](../agent.md) – Clean Architecture, Spec-Driven Development, TypeScript estricto, pnpm.

---

## 1. Contexto y cumplimiento con agent.md

- **API:** REST con **Express.js**
- **Persistencia:** **MongoDB** con **Mongoose**
- **Lenguaje:** **TypeScript (estricto)**
- **Gestor de paquetes:** **pnpm**
- **Arquitectura:** Clean Architecture con separación clara entre **modelos**, **controladores** y **rutas** [agent.md §7]
- **Estilo:** Programación funcional donde sea posible; todos los endpoints con **try/catch** y **validación de tipos** [agent.md §7]
- **Seguridad:** Credenciales y configuración sensible solo en variables de entorno (`.env`) [agent.md §7]

---

## 2. Estructura de carpetas (Clean Architecture)

Separación explícita modelo / controlador / rutas:

```
src/
├── models/           # Modelos de datos (Mongoose)
│   └── Task.ts
├── controllers/      # Lógica de control (manejo de request/response, try/catch)
│   └── taskController.ts
├── routes/           # Definición de endpoints (rutas Express)
│   └── taskRoutes.ts
├── middlewares/      # (opcional) Validación de tipos, errores
│   └── validateTask.ts
├── types/            # Tipos TypeScript (DTOs, request/response)
│   └── task.types.ts
├── config/           # Configuración (env, DB)
│   └── env.ts
└── app.ts | index.ts
```

- **models:** solo esquema y modelo Mongoose (estructura de datos y persistencia).
- **controllers:** orquestan la petición, llaman al modelo, aplican validaciones de tipos y devuelven respuestas; siempre dentro de try/catch.
- **routes:** asignan método HTTP y path a funciones del controlador (sin lógica de negocio).

---

## 3. Modelo de datos (Mongoose)

**Archivo:** `src/models/Task.ts`

- **Colección:** `tasks`
- **Esquema:**

| Campo         | Tipo    | Requerido | Default   | Validación / Notas              |
|---------------|---------|-----------|-----------|---------------------------------|
| `_id`         | ObjectId | sí (auto) | -         | Id de MongoDB                   |
| `title`       | String  | sí        | -         | `minlength: 1`, `maxlength: 255`|
| `description` | String  | no        | `null`    | `maxlength: 2000`               |
| `isCompleted` | Boolean | sí        | `false`   | -                               |
| `createdAt`   | Date    | sí        | `Date.now`| -                               |

- **Índice:** `createdAt: -1` para listados ordenados por fecha descendente.
- Exportar: **modelo Mongoose** tipado con TypeScript (interfaz `ITask` para documentos).

**Interfaz TypeScript del documento (para tipado estricto):**

```ts
interface ITask {
  _id: Types.ObjectId;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: Date;
}
```

---

## 4. Endpoints (rutas Express)

**Base path:** `/api/tasks` (montar el router en la app bajo este prefijo).

| Método | Ruta         | Descripción           | Controlador (función)   |
|--------|--------------|------------------------|-------------------------|
| POST   | `/api/tasks` | Crear una tarea        | `createTask`            |
| GET    | `/api/tasks` | Listar todas las tareas| `listTasks`             |

### POST `/api/tasks`

- **Request body (JSON):**
  - `title`: string, **obligatorio**, no vacío tras `trim`, longitud ≤ 255.
  - `description`: string, opcional; si se envía, longitud ≤ 2000.
- **Responses:**
  - **201 Created:** cuerpo = tarea creada (id, title, description, isCompleted, createdAt en ISO).
  - **400 Bad Request:** validación fallida (ej. título vacío o demasiado largo); cuerpo con mensaje claro.
  - **500 Internal Server Error:** error de servidor; respuesta genérica (sin exponer detalles internos).

### GET `/api/tasks`

- **Query params (opcional en fases futuras):** ninguno obligatorio para esta spec.
- **Responses:**
  - **200 OK:** cuerpo = array de tareas (mismo formato que un ítem de POST); orden **createdAt descendente** (más recientes primero).
  - Array vacío `[]` si no hay tareas.
  - **500 Internal Server Error:** en caso de error de servidor.

---

## 5. Controladores

**Archivo:** `src/controllers/taskController.ts`

Cada handler debe:
- Recibir `req` y `res` (tipados con Express).
- Usar **try/catch** en todo el flujo; en `catch`, responder con código y mensaje apropiados (400/500).
- Validar **tipos y reglas de negocio** antes de usar el modelo (o delegar en un middleware de validación tipado).

### `createTask(req, res)`

1. Extraer y validar `title` y `description` del body (tipos y longitudes).
2. Si la validación falla → responder **400** con mensaje claro (ej. `"El título es obligatorio"` o `"title: longitud máxima 255"`).
3. Crear documento con el modelo Task (title, description, isCompleted: false, createdAt por defecto).
4. Guardar en BD; responder **201** con el objeto tarea (incluyendo `_id` como `id` en JSON si se desea consistencia con cliente).
5. Cualquier excepción no controlada → **catch** → **500**.

### `listTasks(req, res)`

1. Consultar todas las tareas con el modelo, ordenadas por `createdAt` descendente.
2. Responder **200** con el array (vacío si no hay resultados).
3. Cualquier excepción → **catch** → **500**.

Se recomienda usar **funciones puras** para validación (input → resultado de validación) y mantener los handlers lo más funcionales posible [agent.md §7].

---

## 6. Rutas (Express router)

**Archivo:** `src/routes/taskRoutes.ts`

- Crear un `Router()` de Express.
- **POST /** → `taskController.createTask`
- **GET /** → `taskController.listTasks`
- Exportar el router para montarlo en la app: `app.use('/api/tasks', taskRoutes)`.
- Asegurar que la app use `express.json()` para parsear el body en POST.

---

## 7. Validación de tipos y errores

- **Request body (POST):** validar que `title` sea string no vacío (tras trim) y dentro de longitud; `description` opcional y dentro de longitud. Validación en controlador o en middleware dedicado (`middlewares/validateTask.ts`) reutilizable.
- **Respuestas:** formato consistente de tarea:
  - `id` (string, desde `_id`)
  - `title` (string)
  - `description` (string | null)
  - `isCompleted` (boolean)
  - `createdAt` (string ISO 8601)
- **Errores:** cuerpo JSON con al menos `error` o `message` para 400/500.

---

## 8. Resumen de responsabilidades

| Capa          | Responsabilidad                                                                 |
|---------------|----------------------------------------------------------------------------------|
| **models**    | Esquema Mongoose, interfaz ITask, persistencia (estructura de datos).            |
| **controllers** | Handlers createTask y listTasks; try/catch; validación de tipos; respuestas HTTP. |
| **routes**    | Asociar POST/GET a controladores; montaje bajo `/api/tasks`.                     |
| **types**     | DTOs e interfaces TypeScript (request body, respuesta, documento).               |
| **config**    | Carga de variables de entorno (.env) para BD y puerto; sin credenciales en código. |

---

## 9. Criterios de aceptación (para tests unitarios)

- Crear tarea con `title` válido (y opcionalmente `description`) → 201 y cuerpo con la tarea.
- Crear tarea sin `title` o con `title` vacío/espacios → 400.
- Crear tarea con `title` o `description` que excedan longitud máxima → 400.
- Listar sin tareas → 200 y array vacío.
- Listar con una o más tareas → 200 y array ordenado por `createdAt` descendente.
- Errores de servidor/BD en create o list → 500 y mensaje genérico.

Esta especificación define rutas, controladores y modelo Mongoose alineados con **Clean Architecture** (modelos, controladores, rutas) y con las reglas de **agent.md** (TypeScript estricto, try/catch, validación de tipos, programación funcional donde aplique, sin credenciales en código).
