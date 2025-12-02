import { useState } from "react";
import { EmpleadosApi } from "./../api/empleadosApi";
import {
    ReporteAsistencia,
    AsistenciaEmpleado,
    Nomina,
    DiasTrabajados,
    ReporteProduccion,
    HorasTrabajadas,
    UnidadesProducidas,
} from "./../interfaces/empleadosInterface";

const BASE_URL = "http://192.168.1.45:3009/api/dsm44/empleados";

export const useReporteAsistencia = () => {
    const [data, setData] = useState<ReporteAsistencia | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (id_empleado: number, fechaInicio: string, fechaFin: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await EmpleadosApi.get<ReporteAsistencia>(
                `${BASE_URL}/reporte-asistencia-empleado?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            setData(response.data);
        } catch (err) {
            setError("Error cargando reporte asistencia");
            console.error(err);
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
                `${BASE_URL}/asistencia-empleado?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            setData(response.data);
        } catch (err) {
            setError("Error cargando asistencia");
            console.error(err);
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
                `${BASE_URL}/nomina?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            setData(response.data);
        } catch (err) {
            setError("Error cargando nómina");
            console.error(err);
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
                `${BASE_URL}/dias-trabajados?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            setData(response.data);
        } catch (err) {
            setError("Error cargando días trabajados");
            console.error(err);
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
            const response = await EmpleadosApi.get<ReporteProduccion[]>(
                `${BASE_URL}/reporte-produccion?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            setData(response.data);
        } catch (err) {
            setError("Error cargando reporte producción");
            console.error(err);
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
                `${BASE_URL}/horas-trabajadas?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            setData(response.data);
        } catch (err) {
            setError("Error cargando horas trabajadas");
            console.error(err);
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
                `${BASE_URL}/unidades-producidas?id_empleado=${id_empleado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
            );
            setData(response.data);
        } catch (err) {
            setError("Error cargando unidades producidas");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, loadData };
};
