import requests
import random
from datetime import datetime, timedelta
import time
import sys

# Configuración
API_BASE = "http://localhost:3009/api/dsm44"
TOTAL_EMPLEADOS = 300  # Mantenemos reducido para pruebas
YEAR = 2025
EMPLEADOS = []

AREAS = ["OFICINA", "PRODUCCION", "INVENTARIO"]
TURNOS = ["MATUTINO", "VESPERTINO", "NOCTURNO", "MIXTO"]
STATUS_ASISTENCIA = ["EN_TURNO", "FINALIZADO"]

NOMBRES = [
    "Juan", "Carlos", "Luis", "Miguel", "Jose", "Jorge", "Felipe", "Hector",
    "Marco", "Ricardo", "Fernando", "Pablo", "Rafael", "Alberto", "Andres",
    "Roberto", "Eduardo", "Cristian", "Mario", "Diego", "Omar", "Sergio",
    "Francisco", "Adrian", "Hernan", "Erick", "Kevin", "Oscar", "Manuel",
    "Víctor", "Alan", "Emilio", "Ramiro", "Leonardo", "Esteban", "Bruno",
    "Mauricio", "Gustavo", "Elías", "Tomás",
]

APELLIDOS = [
    "Hernandez", "Martinez", "Gomez", "Perez", "Lopez", "Garcia",
    "Rodriguez", "Sanchez", "Ramirez", "Cruz", "Torres", "Rivera",
    "Gonzalez", "Flores", "Vargas", "Castillo", "Ortega", "Ruiz",
    "Aguilar", "Chavez", "Dominguez", "Silva", "Navarro", "Salazar",
    "Mendoza", "Ponce", "Morales", "Soto", "Camacho", "Cortés",
    "Arias", "Palacios", "Estrada", "Valdez", "Montoya", "Ramos"
]

def random_choice(arr):
    return random.choice(arr)

def generar_nombre_completo():
    return {
        "nombre": random_choice(NOMBRES),
        "apellido_p": random_choice(APELLIDOS),
        "apellido_m": random_choice(APELLIDOS)
    }

def generar_fechas_2025():
    fechas = []
    start_date = datetime(YEAR, 1, 1)
    for i in range(365):
        current_date = start_date + timedelta(days=i)
        fechas.append(current_date.strftime("%Y-%m-%d"))
    return fechas

FECHAS_2025 = generar_fechas_2025()

def make_iso(fecha, hour, minute):
    fecha_obj = datetime.strptime(fecha, "%Y-%m-%d")
    return fecha_obj.replace(hour=hour, minute=minute, second=0).isoformat()

def safe_post(url, data, max_intentos=5, delay_ms=1000):
    intento = 0
    
    while intento < max_intentos:
        try:
            response = requests.post(url, json=data, timeout=30)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            intento += 1
            if intento == max_intentos:
                print(f"❌ ERROR después de {max_intentos} intentos -> {url}")
                print(f"   Mensaje: {str(e)}")
                if hasattr(e, 'response') and e.response is not None:
                    print(f"   Status Code: {e.response.status_code}")
                    print(f"   Response: {e.response.text}")
                return None
            print(f"⚠️  Intento {intento}/{max_intentos} falló -> {url}. Reintentando...")
            time.sleep(delay_ms / 1000)

def register_a_p(fecha, empleado):
    entrada_iso = make_iso(fecha, 8, 0)
    salida_iso = make_iso(fecha, 17, 0)
    
    fecha_entrada = datetime.fromisoformat(entrada_iso)
    fecha_salida = datetime.fromisoformat(salida_iso)
    diferencia_horas = (fecha_salida - fecha_entrada).total_seconds() / 3600
    
    print(f"  📅 Registrando asistencia y producción para empleado {empleado} en {fecha}")
    
    # Registrar asistencia
    asistencia_data = {
        "fecha": fecha,
        "horaEntrada": entrada_iso,
        "horaSalida": salida_iso,
        "entrada": entrada_iso,
        "salida": salida_iso,
        "status": random_choice(STATUS_ASISTENCIA),
        "empleado": empleado,
        "horasTrabajadas": diferencia_horas,
    }
    
    register_asistencia = safe_post(f"{API_BASE}/empleados/create-asistencia", asistencia_data)
    
    # Registrar producción
    produccion_data = {
        "fecha": fecha,
        "turno": random_choice(TURNOS),
        "unidadesProducidas": random.randint(0, 3000),
        "empleado": empleado
    }
    
    register_produccion = safe_post(f"{API_BASE}/empleados/create-produccion", produccion_data)
    
    # Verificar resultados
    resultado = {
        "register_asistencia": register_asistencia,
        "register_produccion": register_produccion
    }
    
    if register_asistencia and register_produccion:
        try:
            asistencia_json = register_asistencia.json()
            produccion_json = register_produccion.json()
            print(f"  ✅ Asistencia creada: {asistencia_json.get('id_reg_a', 'N/A')}")
            print(f"  ✅ Producción creada: {produccion_json.get('id_reg_p', 'N/A')}")
        except Exception as e:
            print(f"  ❌ Error parseando respuesta: {e}")
    else:
        if not register_asistencia:
            print(f"  ❌ Falló asistencia para empleado {empleado}")
        if not register_produccion:
            print(f"  ❌ Falló producción para empleado {empleado}")
    
    return resultado

def main():
    print("🚀 INICIANDO POBLACIÓN DE DATOS...")
    print(f"📡 Conectando a: {API_BASE}")
    
    # Verificar que la API esté disponible
    try:
        test_response = requests.get(f"{API_BASE}/empleados", timeout=10)
        print(f"✅ API conectada correctamente (Status: {test_response.status_code})")
    except Exception as e:
        print(f"❌ NO SE PUEDE CONECTAR A LA API: {e}")
        print("   Asegúrate de que el servidor esté ejecutándose en http://localhost:3000")
        return
    
    # Crear empleados
    print(f"\n👥 CREANDO {TOTAL_EMPLEADOS} EMPLEADOS...")
    empleados_creados = 0
    
    for i in range(1, TOTAL_EMPLEADOS + 1):
        data_nombre = generar_nombre_completo()
        
        empleado_payload = {
            "nombre": data_nombre["nombre"],
            "apellido_p": data_nombre["apellido_p"],
            "apellido_m": data_nombre["apellido_m"],
            "area": random_choice(AREAS),
            "turno": random_choice(TURNOS),
            "salarioDiario": round(200 + random.random() * 350, 2),
            "activo": True
        }
        
        print(f"  Creando empleado {i}/{TOTAL_EMPLEADOS}: {empleado_payload['nombre']} {empleado_payload['apellido_p']}")
        
        register = safe_post(f"{API_BASE}/empleados", empleado_payload)
        
        if register and register.status_code in [200, 201]:
            try:
                data = register.json()
                empleado_id = data.get("id_empleado")
                if empleado_id:
                    print(f"  ✅ Empleado creado: ID {empleado_id}")
                    EMPLEADOS.append(empleado_id)
                    empleados_creados += 1
                else:
                    print(f"  ❌ No se recibió ID del empleado")
            except Exception as e:
                print(f"  ❌ Error procesando respuesta: {e}")
        else:
            print(f"  ❌ Falló la creación del empleado {i}")
    
    if not EMPLEADOS:
        print("❌ NO SE CREARON EMPLEADOS. Saliendo...")
        return
    
    print(f"\n✅ SE CREARON {empleados_creados} EMPLEADOS")
    print("📊 INICIANDO REGISTRO DE ASISTENCIAS Y PRODUCCIÓN...")
    
    # Registrar asistencias y producciones - solo algunos días para prueba
    dias_prueba = FECHAS_2025[:7]  # Solo primera semana para prueba
    total_registros = len(dias_prueba) * len(EMPLEADOS)
    registro_actual = 0
    
    print(f"📅 Registrando {len(dias_prueba)} días para {len(EMPLEADOS)} empleados")
    print(f"📈 Total de registros a crear: {total_registros}")
    
    for fecha in dias_prueba:
        print(f"\n🗓️  FECHA: {fecha}")
        for empleado in EMPLEADOS:
            registro_actual += 1
            print(f"  [{registro_actual}/{total_registros}] ", end="")
            register_a_p(fecha, empleado)
            
            # Pequeña pausa para no saturar el servidor
            time.sleep(0.1)
    
    print(f"\n🎉 PROCESO COMPLETADO!")
    print(f"   • Empleados creados: {len(EMPLEADOS)}")
    print(f"   • Días procesados: {len(dias_prueba)}")
    print(f"   • Registros totales: {registro_actual}")

if __name__ == "__main__":
    main()