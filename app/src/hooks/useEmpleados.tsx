import { EmpleadosApi } from "../api/empleadosApi";
import { useEffect, useState, useCallback } from "react";
import { Empleado, EmpleadosResponse, parseSalario, parseBoolean } from "../interfaces/empleadosInterface";

interface UseEmpleados {
    isLoading: boolean;
    empleados: Empleado[];
    totalEmpleados: number;
    currentPage: number;
    totalPages: number;
    loadEmpleados: () => Promise<void>;
    refreshEmpleados: () => Promise<void>;
    hasMore: boolean;
}

export const useEmpleados = (limit: number = 10): UseEmpleados => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [totalEmpleados, setTotalEmpleados] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    
    // Función para normalizar datos del empleado
    const normalizeEmpleado = (empleado: any): Empleado => {
        return {
            ...empleado,
            salarioDiario: parseSalario(empleado.salarioDiario),
            activo: parseBoolean(empleado.activo),
            area: String(empleado.area || ''),
            turno: String(empleado.turno || ''),
            produccion: Array.isArray(empleado.produccion) 
                ? empleado.produccion.map((p: any) => ({
                    ...p,
                    turno: String(p.turno || ''),
                    fecha: p.fecha ? new Date(p.fecha).toISOString() : ''
                }))
                : [],
            asistencia: Array.isArray(empleado.asistencia)
                ? empleado.asistencia.map((a: any) => ({
                    ...a,
                    turno: String(a.turno || ''),
                    estatus: String(a.estatus || ''),
                    fecha: a.fecha ? new Date(a.fecha).toISOString() : '',
                    horaEntrada: a.horaEntrada ? new Date(a.horaEntrada).toISOString() : '',
                    horaSalida: a.horaSalida ? new Date(a.horaSalida).toISOString() : '',
                    puntual: parseBoolean(a.puntual)
                }))
                : []
        };
    };

    const loadEmpleados = useCallback(async (page: number = 1): Promise<void> => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            console.log(`📥 Cargando empleados página ${page}...`);
            const response = await EmpleadosApi.get<EmpleadosResponse>(
                `/empleados?page=${page}&limit=${limit}`
            );
            
            const data = response.data;
            
            // Normalizar datos
            const empleadosNormalizados = data.data.map(normalizeEmpleado);
            
            if (page === 1) {
                setEmpleados(empleadosNormalizados);
            } else {
                setEmpleados(prev => [...prev, ...empleadosNormalizados]);
            }
            
            setTotalEmpleados(data.total);
            setTotalPages(data.totalPages);
            setCurrentPage(data.page);
            setHasMore(data.next !== null);
            
            console.log(`✅ Cargados ${empleadosNormalizados.length} empleados. Total: ${data.total}`);
            
        } catch (error: any) {
            console.error("❌ Error cargando empleados:", {
                message: error.message,
                url: error.config?.url,
                status: error.response?.status
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, limit]);
    
    const refreshEmpleados = useCallback(async (): Promise<void> => {
        await loadEmpleados(1);
    }, [loadEmpleados]);
    
    const loadNextPage = useCallback(async (): Promise<void> => {
        if (!isLoading && hasMore) {
            await loadEmpleados(currentPage + 1);
        }
    }, [isLoading, hasMore, currentPage, loadEmpleados]);
    
    // Cargar inicialmente
    useEffect(() => {
        loadEmpleados(1);
    }, [loadEmpleados]);
    
    return {
        isLoading,
        empleados,
        totalEmpleados,
        currentPage,
        totalPages,
        loadEmpleados: loadNextPage,
        refreshEmpleados,
        hasMore
    };
};