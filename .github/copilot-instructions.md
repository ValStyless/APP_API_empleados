# Copilot Instructions for APP_API_empleados

## Arquitectura General
- El proyecto está dividido en tres carpetas principales:
  - `api/`: Backend con NestJS, maneja la lógica de negocio y la API REST.
  - `app/`: Frontend (React Native), consume la API y presenta la interfaz de usuario.
  - `datos/`: Scripts y datos auxiliares para pruebas o carga inicial.

## Backend (`api/`)
- **Framework:** NestJS (TypeScript).
- **Estructura:**
  - Controladores en `src/empleados/empleados.controller.ts` y `app.controller.ts`.
  - Servicios en `src/empleados/empleados.service.ts` y `app.service.ts`.
  - DTOs y entidades en subcarpetas `dto/` y `entities/`.
  - Enums en `enum/` para áreas, turnos y estados.
- **Flujo:** Los controladores reciben peticiones, delegan a servicios, que usan DTOs y entidades para la lógica y persistencia.
- **Comandos clave:**
  - Instalar dependencias: `npm install`
  - Ejecutar en desarrollo: `npm run start:dev`
  - Ejecutar en producción: `npm run start:prod`
  - Ejecutar pruebas: `npm run test`
- **Convenciones:**
  - Uso estricto de DTOs para validación y transferencia de datos.
  - Separación clara entre controladores, servicios y modelos.

## Frontend (`app/`)
- **Framework:** React Native (TypeScript).
- **Estructura:**
  - Pantallas en `src/screens/`.
  - Hooks personalizados en `src/hooks/` para lógica de negocio y consumo de API.
  - Contextos en `src/context/` para manejo de autenticación y estado global.
  - Temas en `src/themes/`.
  - API en `src/api/empleadosApi.tsx` para comunicación con el backend.
- **Convenciones:**
  - Uso de interfaces TypeScript en `src/interfaces/` para tipado estricto.
  - Hooks para encapsular lógica de datos y efectos secundarios.
  - Contextos para manejar autenticación y estado global.

## Integraciones y Dependencias
- **Comunicación:** El frontend consume la API REST expuesta por el backend NestJS.
- **Dependencias:**
  - Backend: NestJS y dependencias estándar de Node.js.
  - Frontend: React Native y dependencias móviles comunes.

## Flujos de Desarrollo
- **Backend:**
  - Modificar/crear DTOs y entidades según los cambios de modelo.
  - Actualizar servicios y controladores para nuevas rutas o lógica.
  - Ejecutar pruebas unitarias y e2e en `test/`.
- **Frontend:**
  - Crear/editar pantallas y hooks para nuevas funcionalidades.
  - Actualizar interfaces y contextos según cambios en la API.

## Ejemplo de patrón
- **DTO en backend:**
  - `src/empleados/dto/create-empleado.dto.ts` define la estructura esperada para crear empleados.
- **Hook en frontend:**
  - `src/hooks/useEmpleados.tsx` encapsula la lógica para obtener y manipular empleados desde la API.

## Recomendaciones para agentes
- Mantener la separación de responsabilidades entre capas.
- Seguir las convenciones de carpetas y nombres para nuevos archivos.
- Validar cambios en los DTOs y entidades antes de modificar servicios/controladores.
- Sincronizar cambios entre backend y frontend cuando se modifique la API.

---
¿Falta algún flujo, convención o integración importante? Indica detalles para mejorar estas instrucciones.