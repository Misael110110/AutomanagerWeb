# AutoManager Web 🚗🔧

Versión web moderna de la plataforma de gestión operativa para el **Taller Los Ángeles Mecánica Automotriz**, diseñada para ejecutarse en navegadores web (escritorio y móviles) y desplegarse automáticamente en **GitHub Pages**.

---

## 🌟 Características Principales

1. **Dashboard y Métricas en Tiempo Real**:
   - Resumen de órdenes activas, tareas pendientes por mecánico, repuestos bajo stock y vehículos listos para entrega.
   - Panel de "Requiere atención" para órdenes de alta prioridad o bloqueadas en espera de repuestos.
2. **Ciclo de Vida de Órdenes de Trabajo**:
   - Flujo visual estructurado: `RECIBIDA` → `DIAGNOSTICO` → `PLANIFICADA` → `EN_PROCESO` → `EN_REVISION` → `LISTA` → `ENTREGADA`.
   - Bloqueo por material (`ESPERANDO_REPUESTO`).
   - Validación automática: no permite pasar a revisión si hay tareas técnicas pendientes.
3. **Expediente de Vehículos y Clientes**:
   - Registro de placas, marca, modelo, año, kilometraje y contacto telefónico.
   - Historial de reparaciones previas asociado a cada vehículo.
4. **Inventario de Repuestos**:
   - Control de existencias y niveles mínimos de seguridad.
   - Botones rápidos de entrada (`+1`) y salida (`Usar`).
   - Bitácora cronológica de movimientos.
5. **Control de Herramientas**:
   - Préstamo y devolución vinculado al mecánico en turno y la orden de trabajo.
   - Estados: `DISPONIBLE`, `ASIGNADA` y `MANTENIMIENTO`.
6. **Auditoría, Historial y Equipo**:
   - Registro de auditoría (quién hizo qué y cuándo).
   - Reportes operativos de avance.
   - Roles diferenciados: **Gerente / Encargado** (gestión integral) y **Mecánico** (avance de tareas y herramientas).

---

## 💻 Ejecución Local

Para probar la aplicación en tu computadora:

```powershell
# 1. Entrar a la carpeta web
cd AutoManagerWeb

# 2. Instalar dependencias
pnpm install

# 3. Iniciar el servidor de desarrollo
pnpm dev
```

Abre tu navegador en la URL indicada (usualmente `http://localhost:5173`).

---

## 🚀 Despliegue en GitHub Pages

La aplicación está preconfigurada con **GitHub Actions** (`.github/workflows/deploy.yml`) para compilar y publicar automáticamente cada vez que hagas `git push` a la rama `main`.

### Pasos para publicar tu repositorio:

#### 1. Instalar Git (si no lo tienes instalado)
Abre PowerShell y ejecuta:
```powershell
winget install --id Git.Git -e --source winget
```
*(Reinicia la terminal de PowerShell después de la instalación para que reconozca el comando `git`)*.

#### 2. Inicializar y subir a GitHub
```powershell
# En la raíz de tu proyecto
git init
git add .
git commit -m "feat: AutoManager Web listo para GitHub Pages"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

#### 3. Activar GitHub Pages en el repositorio
1. Entra a tu repositorio en GitHub en el navegador.
2. Ve a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En **Build and deployment** > **Source**, selecciona: **GitHub Actions**.
4. ¡Listo! El workflow se ejecutará en la pestaña **Actions** y tu página web estará disponible en minutos en:
   `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

---

## ☁️ Integración con Supabase (Opcional)

Por defecto, la aplicación funciona al 100% de manera **local y sin conexión** guardando los datos en `localStorage` (con usuarios demo predeterminados: **Ángel Martínez** con PIN `1234` y **Carlos** con PIN `1234`).

Si deseas activar la sincronización multi-dispositivo en la nube:
1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ejecuta los scripts SQL que se encuentran en `AutoManagerV0/supabase/migrations/`.
3. Renombra `.env.example` a `.env` en `AutoManagerWeb` y coloca tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_anon
   ```
