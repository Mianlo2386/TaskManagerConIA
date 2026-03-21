🚀 Task Manager AI-First (v2026)
Este proyecto representa una transformación estructural en la creación de software, donde la Inteligencia Artificial no ha sido un simple accesorio, sino la infraestructura central de ejecución bajo una metodología de Arquitectura de Orquestación
. El sistema es una aplicación distribuida y resiliente para la gestión de tareas, construida para validar la capacidad de integrar sistemas desacoplados en la nube con un enfoque de seguridad por diseño
.
🧠 Metodología: Spec-Driven Development (SDD)
A diferencia del desarrollo tradicional, este proyecto se ha liderado mediante el paradigma Spec-First
. Como Director del Proceso, definí los requerimientos y la arquitectura en especificaciones de alto nivel, permitiendo que agentes de IA (Cursor y la "Legión") generaran el código como un artefacto derivado, siempre bajo mi supervisión crítica en el ciclo Human in the Loop (HITL)
.
🛠️ Stack Tecnológico Orquestado
Backend: Node.js + Express (Módulos ESMnativo) desplegado en Vercel como Serverless Functions [Conversación anterior].
Frontend: React 19 + Vite + Tailwind CSS, operando de forma desacoplada para garantizar escalabilidad independiente [Conversación anterior].
Base de Datos: MongoDB Atlas (Cloud) con persistencia real y esquemas validados [332, Conversación anterior].
🛡️ Pilares de Arquitectura y Seguridad
Principio Fail-fast: Implementamos un componente de SystemStatus que realiza pings preventivos al endpoint /health del backend; si la infraestructura no está validada, el sistema bloquea operaciones de escritura para proteger la integridad de los datos [386, Conversación anterior].
Seguridad por Diseño: El acceso está blindado mediante middleware de Helmet y una política estricta de CORS que solo confía en orígenes de producción validados, eliminando vulnerabilidades estándar [412, Conversación anterior].
Responsabilidad Profesional: Cada línea de código generada ha sido auditada para asegurar que no solo "funcione", sino que sea sostenible y escalable en un entorno real de producción
.
🚀 Despliegue en Producción
El proyecto utiliza una configuración de Monorepo en Vercel, permitiendo que el frontend y el backend coexistan en el mismo repositorio pero se desplieguen como entidades autónomas, sincronizadas mediante variables de entorno (VITE_API_URL) 
