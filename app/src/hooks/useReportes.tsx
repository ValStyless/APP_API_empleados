import { useState } from "react";
import { EmpleadosApi } from "../api/empleadosApi";
import {
    ReporteAsistencia,
    AsistenciaEmpleado,
    Nomina,
    DiasTrabajados,
    ReporteProduccion,
    HorasTrabajadas,
    UnidadesProducidas
} from "../interfaces/empleadosInterface";

import { parseBoolean } from "../interfaces/empleadosInterface";

// Helper para normalizar fechas
const normalizeDate = (dateString: any): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString();
    } catch {
        return String(dateString);
    }
};

export const useReporteAsistencia = () => {
    const [data, setData] = useState<ReporteAsistencia & { totalHorasTrabajadas?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const url = `/empleados/reporte-asistencia-empleado?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            console.log(`📥 Cargando: ${url}`);
            const response = await EmpleadosApi.get(url);
            // Normalizar datos
            const normalizedData = {
                ...response.data,
                data: response.data.data?.map(item => ({
                    ...item,
                    a_fecha: normalizeDate(item.a_fecha),
                    a_horaEntrada: item.a_horaEntrada && item.a_horaEntrada !== '--:--' ? normalizeDate(item.a_horaEntrada) : '',
                    a_horaSalida: item.a_horaSalida && item.a_horaSalida !== '--:--' ? normalizeDate(item.a_horaSalida) : '',
                    a_turno: String(item.a_turno || ''),
                    a_horasTrabajadas: item.a_horasTrabajadas ? Number(item.a_horasTrabajadas) : 0
                })) || [],
                totalHorasTrabajadas: response.data.totalHorasTrabajadas || 0
            };
            setData(normalizedData);
            console.log(`✅ Reporte asistencia cargado: ${normalizedData.total} registros, total horas: ${normalizedData.totalHorasTrabajadas}`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Error cargando reporte de asistencia";
            setError(errorMsg);
            console.error("❌ Error useReporteAsistencia:", {
                message: err.message,
                url: err.config?.url,
                status: err.response?.status
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return { data, isLoading, error, loadData };
};

export const useAsistenciaEmpleado = () => {
    const [data, setData] = useState<AsistenciaEmpleado | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await EmpleadosApi.get<AsistenciaEmpleado>(
                `/empleados/asistencia-empleado?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            
            setData(response.data);
            console.log(`✅ Asistencia empleado: ${response.data.total_asistencias} asistencias`);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Error cargando asistencia");
            console.error("❌ Error useAsistenciaEmpleado:", err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, loadData };
};

export const useNomina = () => {
    const [data, setData] = useState<Nomina | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await EmpleadosApi.get<Nomina>(
                `/empleados/nomina?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            
            // Normalizar datos de nómina
            const normalizedData = {
                ...response.data,
                asistencias: response.data.asistencias?.map(asistencia => ({
                    ...asistencia,
                    fecha: normalizeDate(asistencia.fecha),
                    horaEntrada: normalizeDate(asistencia.horaEntrada),
                    horaSalida: normalizeDate(asistencia.horaSalida),
                    puntual: parseBoolean(asistencia.puntual),
                    turno: String(asistencia.turno || ''),
                    estatus: String(asistencia.estatus || '')
                })) || []
            };
            
            setData(normalizedData);
            console.log(`✅ Nómina cargada: ${normalizedData.diasTrabajados} días, $${normalizedData.total}`);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Error cargando nómina");
            console.error("❌ Error useNomina:", err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, loadData };
};

export const useDiasTrabajados = () => {
    const [data, setData] = useState<DiasTrabajados[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await EmpleadosApi.get<DiasTrabajados[]>(
                `/empleados/dias-trabajados?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            
            // Normalizar fechas
            const normalizedData = response.data.map(item => ({
                ...item,
                a_fecha: normalizeDate(item.a_fecha),
                a_horaEntrada: normalizeDate(item.a_horaEntrada),
                a_horaSalida: normalizeDate(item.a_horaSalida)
            }));
            
            setData(normalizedData);
            console.log(`✅ Días trabajados: ${normalizedData.length} registros`);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Error cargando días trabajados");
            console.error("❌ Error useDiasTrabajados:", err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, loadData };
};

export const useReporteProduccion = () => {
    const [data, setData] = useState<ReporteProduccion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await EmpleadosApi.get(`/empleados/reporte-produccion?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            // Normalizar datos agrupados por día
            const normalizedData = response.data.map(item => ({
                ...item,
                p_fecha: normalizeDate(item.p_fecha),
                p_turno: String(item.p_turno || ''),
                p_unidadesProducidas: Number(item.p_unidadesProducidas) || 0
            }));
            setData(normalizedData);
            console.log(`✅ Reporte producción: ${normalizedData.length} registros (agrupados por día)`);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Error cargando reporte de producción");
            console.error("❌ Error useReporteProduccion:", err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, loadData };
};

export const useHorasTrabajadas = () => {
    const [data, setData] = useState<HorasTrabajadas[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await EmpleadosApi.get<HorasTrabajadas[]>(
                `/empleados/horas-trabajadas?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            
            // Normalizar datos
            const normalizedData = response.data.map(item => ({
                ...item,
                a_fecha: normalizeDate(item.a_fecha),
                a_horasTrabajadas: Number(item.a_horasTrabajadas) || 0,
                a_turno: String(item.a_turno || '')
            }));
            
            setData(normalizedData);
            console.log(`✅ Horas trabajadas: ${normalizedData.length} registros`);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Error cargando horas trabajadas");
            console.error("❌ Error useHorasTrabajadas:", err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, loadData };
};

export const useUnidadesProducidas = () => {
    const [data, setData] = useState<UnidadesProducidas | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await EmpleadosApi.get<UnidadesProducidas>(
                `/empleados/unidades-producidas?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            
            // Normalizar datos
            const normalizedData = {
                ...response.data,
                empleado: {
                    ...response.data.empleado,
                    area: String(response.data.empleado?.area || ''),
                    turno: String(response.data.empleado?.turno || '')
                }
            };
            
            setData(normalizedData);
            console.log(`✅ Unidades producidas: ${normalizedData.total?.[0]?.total_producido || '0'} unidades`);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Error cargando unidades producidas");
            console.error("❌ Error useUnidadesProducidas:", err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, loadData };
};