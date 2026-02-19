# MEMORY MAP - Adriel's HealthCore

## Reglas de Oro del Proyecto

### 🔐 Privacidad y Multitenancy (Modelo por UUID)
Estas reglas son de cumplimiento obligatorio para asegurar el aislamiento total entre doctores:

1. **Propiedad por UUID:** Los pacientes pertenecen a un `doctor_id` (UUID) que mapea directamente a `auth_users.id`.
2. **Identificación Administrativa:** Cada doctor tiene su propia secuencia de pacientes, pero a nivel de sistema se usa `control_number` (SERIAL) como ID administrativo único global.
3. **Unicidad Compuesta:** La cédula del paciente solo es única dentro de la base de datos de un mismo doctor (`UNIQUE(doctor_id, cedula)`). Esto permite portabilidad entre consultorios sin colisiones.
4. **Herencia de Asistentes:** Si un usuario tiene un `parent_doctor_id` (vinculado a la tabla `users`), sus permisos de lectura/escritura en `patients` se heredan del `doctor_id` (UUID) del doctor principal.
5. **Filtrado Automático:** Toda consulta en el dashboard y APIs DEBE incluir el filtro `WHERE doctor_id = [OWNER_UUID]`.

## Arquitectura de Base de Datos
- **Autenticación:** Compatible con Auth.js (tablas `auth_users`, `auth_accounts`, `auth_sessions`).
- **Usuarios:** Gestión de roles (`doctor`, `nurse`, `administrator`, `superuser`).
- **Pacientes:** Almacenamiento de perfiles médicos con vinculación al creador.
- **Consultas:** Historial médico vinculado a paciente y doctor.
- **Auditoría:** Registro de cada acción significativa en `audit_logs`.