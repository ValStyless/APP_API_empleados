import { EmpleadosApi } from "./../api/empleadosApi";
import { useEffect, useState, useRef } from "react";
import { Empleados, CreateEmpleadoDto } from "./../interfaces/empleadosInterface";

interface UseEmpleados {
    isLoading: boolean;
    empleados: CreateEmpleadoDto[];
    LoadEmpleados: () => void;
}

export const useEmpleados = (): UseEmpleados => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [empleados, setEmpleados] = useState<CreateEmpleadoDto[]>([]);
    const nextPageUrl = useRef("http://192.168.1.45:3009/api/dsm44/empleados");

    const LoadEmpleados = async() => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const respuesta = await EmpleadosApi.get<Empleados>(nextPageUrl.current);
            nextPageUrl.current = respuesta.data.next || nextPageUrl.current;
            setEmpleados((prevList) => [...prevList, ...respuesta.data.data as unknown as CreateEmpleadoDto[]]);
        } catch (error) {
            console.error("Error cargando empleados:", error);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        LoadEmpleados();
    }, []);

    return {
        isLoading,
        empleados,
        LoadEmpleados
    }
}
