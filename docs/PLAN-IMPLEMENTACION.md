# Plan de implementación – API REST Task Manager

**Referencia:** [SPEC-TASKS-API.md](./SPEC-TASKS-API.md) · [agent.md](../agent.md)  
**Objetivo:** Implementar la API en pasos pequeños y manejables, con configuración inicial, conexión segura a MongoDB y endpoints CRUD completos.  
**Sin código en este documento:** solo pasos en lenguaje natural para tu validación.

---

## Fase 1: Configuración inicial del entorno

### 1.1 Inicializar proyecto Node.js con pnpm
- Crear `package.json` en la raíz del proyecto (si no existe).
- Definir nombre del proyecto, tipo módulo si se usa ESM, y scripts: `dev` (con ts-node-dev o similar), `build` (compilar TypeScript), `start` (ejecutar compilado), `test` (ejecutar tests).
- Usar **pnpm** como gestor: instalar dependencias con `pnpm install` y documentar que no se debe usar npm/yarn para este proyecto.

### 1.2 Configurar TypeScript en modo estricto
- Añadir archivo `tsconfig.json` en la raíz.
- Activar `strict: true` y opciones recomendadas (ej. `esModuleInterop`, `skipLibCheck`, `outDir`, `rootDir`).
- Asegurar que `rootDir` apunte a `src` (o la carpeta donde esté el código fuente) y `outDir` a una carpeta de salida (ej. `dist`).

### 1.3 Instalar dependencias de producción y desarrollo
- **Producción:** express, mongoose, dotenv (o similar para variables de entorno).
- **Desarrollo:** typescript, @types/node, @types/express, ts-node-dev (o nodemon + ts-node), y un runner de tests (ej. vitest o jest) con tipos para TypeScript.
- Instalar todo con pnpm; no commitear `node_modules`.

### 1.4 Estructura de carpetas y archivo de entrada
- Crear las carpetas según la spec: `src/models`, `src/controllers`, `src/routes`, `src/types`, `src/config`, y opcionalmente `src/middlewares`.
- Crear un archivo de entrada (ej. `src/index.ts` o `src/app.ts` + `src/index.ts`) que por ahora solo importe Express y levante un servidor en un puerto fijo o leyendo una variable de entorno, sin rutas aún, para validar que el proyecto compila y arranca.

---

## Fase 2: Variables de entorno y conexión segura a MongoDB

### 2.1 Configuración de variables de entorno
- Crear archivo `src/config/env.ts` (o equivalente) que lea variables de entorno: al menos `PORT` y `MONGODB_URI`.
- Usar una librería como `dotenv` para cargar un archivo `.env` en desarrollo; en producción asumir que las variables ya están definidas en el sistema.
- No incluir valores reales de credenciales en el código; solo referencias a `process.env.MONGODB_URI`, etc.
- Crear un archivo `.env.example` en la raíz con claves sin valores (ej. `MONGODB_URI=`, `PORT=`) y un comentario indicando que se debe copiar a `.env` y rellenar. Añadir `.env` al `.gitignore` para que nunca se suban credenciales.

### 2.2 Conexión segura a MongoDB
- Crear un módulo de conexión (ej. `src/config/database.ts` o dentro de `src/config/`) que exporte una función `connectDB` (o similar).
- Dentro de esa función, usar `mongoose.connect()` con la URI obtenida desde `env` (nunca URI hardcodeada).
- Configurar opciones recomendadas de Mongoose para entornos modernos (ej. evitar opciones deprecadas).
- Manejar errores de conexión (log o throw) y exportar la función para invocarla desde el punto de entrada de la app (antes de montar rutas o escuchar en el puerto).
- En el arranque de la aplicación: primero conectar a MongoDB, y solo si la conexión es exitosa (o según tu criterio de fallo), levantar el servidor HTTP en el puerto configurado.

---

## Fase 3: Modelo de datos y tipos

### 3.1 Definir tipos TypeScript para Task
- Crear `src/types/task.types.ts` con la interfaz del documento (ej. `ITask`) y los tipos para el body de creación (CreateTaskBody) y para la respuesta pública de una tarea (TaskResponse), de modo que id/createdAt estén tipados (por ejemplo id como string, createdAt como string ISO).
- Opcional: tipos para errores de validación o respuestas de error consistentes.

### 3.2 Modelo Mongoose Task
- Crear `src/models/Task.ts`.
- Definir el esquema con los campos de la spec: title (required, minlength 1, maxlength 255), description (opcional, maxlength 2000, default null), isCompleted (default false), createdAt (default Date.now).
- Añadir índice en `createdAt` descendente para el listado.
- Crear y exportar el modelo tipado con la interfaz ITask (genérico de Mongoose).
- No poner lógica de negocio aquí; solo definición del esquema y del modelo.

---

## Fase 4: Endpoints de creación y listado (según spec actual)

### 4.1 Controlador: crear tarea (POST)
- Crear `src/controllers/taskController.ts` (si no existe).
- Implementar la función `createTask`: recibir req y res; dentro de un try/catch, extraer y validar `title` y `description` del body (tipos y longitudes según spec). Si la validación falla, responder con status 400 y un mensaje claro en JSON. Si es válido, crear una instancia del modelo Task con los datos, guardarla en BD y responder 201 con el objeto tarea en formato respuesta (id, title, description, isCompleted, createdAt). En el catch, responder 500 con un mensaje genérico (sin exponer detalles internos).

### 4.2 Controlador: listar tareas (GET)
- En el mismo archivo, implementar `listTasks`: dentro de try/catch, consultar todas las tareas con el modelo, ordenadas por createdAt descendente, convertir a formato respuesta (array de objetos con id, title, description, isCompleted, createdAt) y responder 200. Si no hay tareas, devolver array vacío. En catch, responder 500.

### 4.3 Rutas de tareas
- Crear `src/routes/taskRoutes.ts`: crear un Router de Express, registrar POST `/` asociado a `createTask` y GET `/` asociado a `listTasks`.
- En el archivo de entrada de la app, montar el router bajo el prefijo `/api/tasks` y asegurar que se use `express.json()` para parsear el body en las peticiones POST.

### 4.4 Validación y consistencia
- Revisar que todas las respuestas de tarea usen el mismo formato (TaskResponse) y que los errores 400/500 tengan un formato JSON consistente (ej. `{ message: "..." }` o `{ error: "..." }`).
- Opcional en esta fase: extraer la validación del body a un middleware reutilizable en `src/middlewares/validateTask.ts` y usarlo en la ruta POST.

---

## Fase 5: Endpoints CRUD restantes (Read one, Update, Delete)

### 5.1 Obtener una tarea por ID (GET por id)
- En la spec de rutas: definir GET `/api/tasks/:id`.
- En el controlador, implementar `getTaskById`: recibir el id de los params; validar que sea un ObjectId válido (Mongoose); dentro de try/catch, buscar la tarea por id. Si no existe, responder 404; si existe, responder 200 con la tarea en formato respuesta. En catch (ej. error de BD), responder 500.

### 5.2 Actualizar una tarea (PUT o PATCH)
- Definir PUT `/api/tasks/:id` (o PATCH) en las rutas.
- Implementar `updateTask` en el controlador: recibir id por params y body con campos editables (title, description, isCompleted según lo que se quiera permitir). Validar ObjectId y validar tipos/longitudes del body. Buscar la tarea por id; si no existe, 404. Si existe, actualizar los campos permitidos, guardar y responder 200 con la tarea actualizada. Try/catch; en catch 500.

### 5.3 Eliminar una tarea (DELETE)
- Definir DELETE `/api/tasks/:id` en las rutas.
- Implementar `deleteTask`: recibir id por params; validar ObjectId; buscar y eliminar. Si no existía, 404; si se eliminó, 204 No Content (o 200 con mensaje). Try/catch; en catch 500.

### 5.4 Actualizar el router
- Registrar en `taskRoutes.ts` las nuevas rutas: GET `/:id`, PUT (o PATCH) `/:id`, DELETE `/:id`, asociadas a los nuevos métodos del controlador.

---

## Fase 6: Calidad y cierre

### 6.1 Tests unitarios (según agent.md)
- Para el controlador de tareas: tests que cubran create (éxito, validación fallida, error de servidor), list (vacío y con datos), getById (encontrado, no encontrado, id inválido), update (éxito, no encontrado, validación), delete (éxito, no encontrado).
- Los tests deben usar un mock del modelo Mongoose (o BD en memoria) para no depender de MongoDB real; ejecutar con el script `pnpm test`.
- Asegurar que cada funcionalidad nueva tenga su suite de tests antes de dar la tarea por finalizada.

### 6.2 Revisión final
- Verificar que no queden credenciales ni URIs en el código; que `.env` esté en `.gitignore` y que `.env.example` esté documentado.
- Verificar que todos los endpoints tengan try/catch y validación de tipos/reglas según la spec y agent.md.
- Opcional: añadir un README breve con cómo instalar dependencias (pnpm install), configurar `.env` y ejecutar en dev (pnpm dev) y tests (pnpm test).

---

## Task list (resumen para validación)

| # | Fase | Tarea |
|---|------|--------|
| 1 | 1.1 | Inicializar proyecto Node con pnpm y package.json (scripts dev, build, start, test). |
| 2 | 1.2 | Configurar TypeScript estricto (tsconfig.json). |
| 3 | 1.3 | Instalar dependencias (express, mongoose, dotenv, typescript, types, ts-node-dev, test runner). |
| 4 | 1.4 | Crear estructura de carpetas src y archivo de entrada que levante el servidor en un puerto. |
| 5 | 2.1 | Configuración de variables de entorno (config/env.ts, .env.example, .gitignore). |
| 6 | 2.2 | Módulo de conexión segura a MongoDB (config/database) y arranque condicional en index. |
| 7 | 3.1 | Definir tipos TypeScript para Task (ITask, CreateTaskBody, TaskResponse) en types/task.types.ts. |
| 8 | 3.2 | Crear modelo Mongoose Task (esquema, índice, export) en models/Task.ts. |
| 9 | 4.1 | Implementar createTask en taskController con try/catch y validación. |
| 10 | 4.2 | Implementar listTasks en taskController con try/catch. |
| 11 | 4.3 | Crear taskRoutes (POST /, GET /) y montar en /api/tasks con express.json(). |
| 12 | 4.4 | Revisar formato de respuestas y opcional middleware de validación. |
| 13 | 5.1 | GET /api/tasks/:id y getTaskById (404 si no existe). |
| 14 | 5.2 | PUT (o PATCH) /api/tasks/:id y updateTask (404, validación). |
| 15 | 5.3 | DELETE /api/tasks/:id y deleteTask (404, 204). |
| 16 | 5.4 | Registrar en taskRoutes las rutas :id. |
| 17 | 6.1 | Suite de tests unitarios para el controlador (create, list, getById, update, delete). |
| 18 | 6.2 | Revisión final (env, try/catch, README opcional). |

---

Cuando valides este plan, se puede proceder a la implementación por bloques (sin escribir todo el código de golpe) y, por cada funcionalidad, generar los tests antes de darla por cerrada.
