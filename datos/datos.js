const axios = require("axios");

const API_BASE = "http://localhost:3000/api/dsm44/empleados";
const TOTAL_EMPLEADOS = 80;
const YEAR = 2025;
const EMPLEADOS = [];

const AREAS = ["OFICINA", "PRODUCCION", "INVENTARIO"];
const TURNOS = ["MATUTINO", "VESPERTINO", "NOCTURNO", "MIXTO"];
const STATUS_ASISTENCIA = ["EN_TURNO", "FINALIZADO"];

const NOMBRES = [
  "Juan","Carlos","Luis","Miguel","Jose","Jorge","Felipe","Hector",
  "Marco","Ricardo","Fernando","Pablo","Rafael","Alberto","Andres",
  "Roberto","Eduardo","Cristian","Mario","Diego","Omar","Sergio",
  "Francisco","Adrian","Hernan","Erick","Kevin","Oscar","Manuel",
  "Víctor","Alan","Emilio","Ramiro","Leonardo","Esteban","Bruno",
  "Mauricio","Gustavo","Elías","Tomás",
];

const APELLIDOS = [
  "Hernandez","Martinez","Gomez","Perez","Lopez","Garcia",
  "Rodriguez","Sanchez","Ramirez","Cruz","Torres","Rivera",
  "Gonzalez","Flores","Vargas","Castillo","Ortega","Ruiz",
  "Aguilar","Chavez","Dominguez","Silva","Navarro","Salazar",
  "Mendoza","Ponce","Morales","Soto","Camacho","Cortés",
  "Arias","Palacios","Estrada","Valdez","Montoya","Ramos"
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generarNombreCompleto = () => {
    return {
        nombre: random(NOMBRES),
        apellido_p: random(APELLIDOS),
        apellido_m: random(APELLIDOS)
    }
}

const generarFechas2025 = () => {
  const fechas = [];
  const start = new Date(`${YEAR}-01-01T00:00:00Z`);
  for (let d = 0; d < 365; d++) {
    const cur = new Date(start);
    cur.setUTCDate(cur.getUTCDate() + d);
    // Formato DD/MM/YYYY para la API corregida
    const day = String(cur.getUTCDate()).padStart(2, '0');
    const month = String(cur.getUTCMonth() + 1).padStart(2, '0');
    const year = cur.getUTCFullYear();
    fechas.push(`${day}/${month}/${year}`);
  }
  return fechas;
}

const FECHAS_2025 = generarFechas2025();

// Convertir fecha DD/MM/YYYY a Date object
const parseFecha = (fechaStr) => {
  const [day, month, year] = fechaStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

const safePost = async (url, body, maxIntentos = 10, delayMs = 1000) => {
    let intento = 0;

    while (intento < maxIntentos) {
        try {
            console.log(`Enviando POST a ${url}...`);
            const response = await axios.post(url, body);
            console.log(`✅ POST exitoso a ${url}`);
            return response;
        } catch (e) {
            intento++;
            if (e.response) {
                console.error(`Error ${e.response.status} en ${url}:`, e.response.data);
            } else {
                console.error(`Error de red en ${url}:`, e.message);
            }
            
            if (intento === maxIntentos) {
                console.error(`❌ Fallo Final después de ${maxIntentos} intentos -> ${url}`);
                return null;
            }
            console.warn(`⚠️ Reintento ${intento}/${maxIntentos} -> ${url} en ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
};

const registerA_P = async (fecha, empleado) => {
    try {
        // Parsear fecha DD/MM/YYYY para cálculos
        const fechaDate = parseFecha(fecha);
        
        // Generar horas aleatorias según el turno del empleado
        const horaEntrada = Math.floor(Math.random() * 3) + 6; // Entre 6:00 y 9:00
        const horaSalida = horaEntrada + 8 + Math.floor(Math.random() * 2); // 8-9 horas después
        
        // Crear fechas completas con horas
        const entradaDate = new Date(fechaDate);
        entradaDate.setHours(horaEntrada, Math.floor(Math.random() * 60), 0, 0);
        
        const salidaDate = new Date(fechaDate);
        salidaDate.setHours(horaSalida, Math.floor(Math.random() * 60), 0, 0);
        
        // Calcular horas trabajadas
        const diferenciaEnMilisegundos = salidaDate - entradaDate;
        const diferenciaEnHoras = parseFloat((diferenciaEnMilisegundos / 3600000).toFixed(2));
        
        // Determinar puntualidad (antes de las 8:00)
        const puntual = horaEntrada < 8 || (horaEntrada === 8 && entradaDate.getMinutes() === 0);
        
        // Formato de fechas para la API (ISO string)
        const fechaISO = fechaDate.toISOString().split('T')[0];
        const entradaISO = entradaDate.toISOString();
        const salidaISO = salidaDate.toISOString();
        
        // Elegir un turno aleatorio
        const turno = random(TURNOS);
        
        // Elegir estatus aleatorio (80% FINALIZADO, 20% EN_TURNO)
        const estatus = Math.random() > 0.2 ? "FINALIZADO" : "EN_TURNO";
        
        console.log(`Registrando asistencia para empleado ${empleado} - Fecha: ${fecha}`);
        
        const register_asistencia = await safePost(`${API_BASE}/create-asistencia`, {
            id_empleado: empleado,
            fecha: fechaISO, // Formato YYYY-MM-DD
            horaEntrada: entradaISO,
            horaSalida: salidaISO,
            horasTrabajadas: diferenciaEnHoras,
            puntual: puntual, // Booleano real
            turno: turno,
            estatus: estatus
        });
        
        console.log(`Registrando producción para empleado ${empleado} - Fecha: ${fecha}`);
        
        const register_produccion = await safePost(`${API_BASE}/create-produccion`, {
            id_empleado: empleado,
            fecha: fechaISO, // Formato YYYY-MM-DD
            turno: turno,
            unidadesProducidas: Math.floor(Math.random() * 300) + 50 // Entre 50 y 350 unidades
        });
        
        return {
            register_asistencia,
            register_produccion
        };
    } catch (error) {
        console.error(`Error en registerA_P para empleado ${empleado}, fecha ${fecha}:`, error.message);
        return null;
    }
}

const main = async() => {
    console.log("🚀 Iniciando inserción de datos...");
    console.log("=".repeat(50));
    
    // Paso 1: Crear empleados
    console.log(`📝 Creando ${TOTAL_EMPLEADOS} empleados...`);
    for (let i = 1; i <= TOTAL_EMPLEADOS; i++) {
        try {
            const dataNombre = generarNombreCompleto();
            
            const empleadoPayload = {
                nombre: dataNombre.nombre,
                apellido_p: dataNombre.apellido_p,
                apellido_m: dataNombre.apellido_m,
                area: random(AREAS),
                turno: random(TURNOS),
                salarioDiario: parseFloat((200 + Math.random() * 350).toFixed(2)),
                activo: true
            };
            
            console.log(`Creando empleado ${i}/${TOTAL_EMPLEADOS}: ${empleadoPayload.nombre} ${empleadoPayload.apellido_p}`);
            
            const register = await safePost(API_BASE, empleadoPayload);
            
            if (register && register.data) {
                const data = register.data;
                console.log(`✅ Empleado creado: ID ${data.id_empleado} - ${data.nombre} ${data.apellido_p}`);
                EMPLEADOS.push(data.id_empleado);
                
                // Pequeña pausa entre empleados para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error(`Error creando empleado ${i}:`, error.message);
        }
    }
    
    console.log(`✅ ${EMPLEADOS.length} empleados creados exitosamente`);
    console.log("=".repeat(50));
    
    if (EMPLEADOS.length === 0) {
        console.log("❌ No se crearon empleados. Saliendo...");
        return;
    }
    
    // Paso 2: Crear registros de asistencia y producción
    console.log("📊 Creando registros de asistencia y producción...");
    
    // Limitar a algunos días para no sobrecargar (opcional)
    const diasAMostrar = FECHAS_2025.slice(0, 30); // Solo primeros 30 días
    
    for (const fecha of diasAMostrar) {
        console.log(`📅 Procesando fecha: ${fecha}`);
        
        for (const empleado of EMPLEADOS) {
            try {
                // Solo crear registros algunos días (70% de probabilidad)
                if (Math.random() < 0.7) {
                    const registros = await registerA_P(fecha, empleado);
                    
                    if (registros?.register_asistencia && registros?.register_produccion) {
                        console.log(`✅ Registros creados para empleado ${empleado} en ${fecha}`);
                    }
                    
                    // Pequeña pausa entre registros
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            } catch (error) {
                console.error(`Error procesando empleado ${empleado} en fecha ${fecha}:`, error.message);
            }
        }
    }
    
    console.log("=".repeat(50));
    console.log("🎉 Proceso completado exitosamente!");
    console.log(`📊 Empleados creados: ${EMPLEADOS.length}`);
    console.log(`📅 Días procesados: ${diasAMostrar.length}`);
}

// Manejo de errores global
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
});

// Ejecutar el script
main().catch(error => {
    console.error('❌ Error en la ejecución principal:', error);
});