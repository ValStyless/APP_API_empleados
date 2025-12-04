// Interfaces principales - CORREGIDAS según la API
export interface Empleado {
    id_empleado:    number;
    nombre:         string;
    apellido_p:     string;
    apellido_m:     string;
    area:           string;  // La API devuelve string del enum
    turno:          string;  // La API devuelve string del enum
    salarioDiario:  number | string;  // La API puede devolver string o number
    activo:         boolean;
    produccion?:    Produccion[];
    asistencia?:    Asistencia[];
}

export interface Asistencia {
    id_reg_a:           number;
    fecha:              string;
    horaEntrada:        string;
    horaSalida:         string;
    puntual:            boolean;
    horasTrabajadas:    number;
    turno:              string;
    estatus:            string;
}

export interface Produccion {
    id_reg_p:           number;
    fecha:              string;
    turno:              string;
    unidadesProducidas: number;
}

// Interfaces para paginación
export interface EmpleadosResponse {
    total:      number;
    totalPages: number;
    prev:       string | null;
    next:       string | null;
    page:       number;
    limit:      number;
    data:       Empleado[];
}

// Interfaces para reportes - CORREGIDAS según la API
export interface ReporteAsistencia {
    total: number;
    data: AsistenciaItem[];
}

export interface AsistenciaItem {
    a_id_reg_a:         number;
    a_fecha:            string;
    a_horaEntrada:      string;
    a_horaSalida:       string;
    a_turno:            string;
    e_id_empleado:      number;
    e_nombre:           string;
    e_apellido_p:       string;
    e_apellido_m:       string;
}

export interface AsistenciaEmpleado {
    total_asistencias: string;
}

export interface Nomina {
    diasTrabajados: number;
    asistencias:    Asistencia[];
    total:          number;
}

export interface DiasTrabajados {
    a_id_reg_a:     number;
    a_fecha:        string;
    a_horaEntrada:  string;
    a_horaSalida:   string;
}

export interface ReporteProduccion {
    p_id_reg_p:             number;
    p_fecha:                string;
    p_turno:                string;
    p_unidadesProducidas:   number;
    e_id_empleado:          number;
    e_nombre:               string;
    e_apellido_p:           string;
    e_apellido_m:           string;
}

export interface HorasTrabajadas {
    a_id_reg_a:         number;
    a_fecha:            string;
    a_horasTrabajadas:  number;
    a_turno:            string;
    e_nombre:           string;
    e_apellido_p:       string;
    e_apellido_m:       string;
}

export interface UnidadesProducidas {
    empleado:   {
        id_empleado: number;
        nombre: string;
        apellido_p: string;
        apellido_m: string;
        area: string;
        turno: string;
    };
    total:      { total_producido: string }[];
}

// Helper functions para tipos
export const parseSalario = (salario: number | string): number => {
    if (typeof salario === 'string') {
        return parseFloat(salario) || 0;
    }
    return salario || 0;
};

export const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
};