import React, { useEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RootStackParamList } from '../../App';
import { useReporteAsistencia, useAsistenciaEmpleado, useNomina, useDiasTrabajados, useReporteProduccion, useHorasTrabajadas,useUnidadesProducidas 
} from '../hooks/useReportes';

type Props = StackScreenProps<RootStackParamList, 'EmpleadosScreens'>;
export const EmpleadosScreens = ({ route, navigation }: Props) => {
    const { empleado } = route.params;
    const reporteAsistencia = useReporteAsistencia();
    const asistenciaEmpleado = useAsistenciaEmpleado();
    const nomina = useNomina();
    const dias = useDiasTrabajados();
    const produccion = useReporteProduccion();
    const horas = useHorasTrabajadas();
    const unidades = useUnidadesProducidas();
    const fechaInicio = "01/01/2025";
    const fechaFin = "31/12/2025";

    useEffect(() => {
        if (!empleado) return;
        const id = empleado.id_empleado;
        reporteAsistencia.loadData(id, fechaInicio, fechaFin);
        asistenciaEmpleado.loadData(id, fechaInicio, fechaFin);
        nomina.loadData(id, fechaInicio, fechaFin);
        dias.loadData(id, fechaInicio, fechaFin);
        produccion.loadData(id, fechaInicio, fechaFin);
        horas.loadData(id, fechaInicio, fechaFin);
        unidades.loadData(id, fechaInicio, fechaFin);
    }, [empleado]);

    const cargando =
        reporteAsistencia.isLoading ||
        asistenciaEmpleado.isLoading ||
        nomina.isLoading ||
        dias.isLoading ||
        produccion.isLoading ||
        horas.isLoading ||
        unidades.isLoading;

    if (cargando) {
        return (
            <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    return (
        <ScrollView style={estilos.raiz} contentContainerStyle={{ padding: 12 }}>
            <View>
                <TouchableOpacity
                    style={estilos.botonRegresar}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Text style={estilos.textoBotonRegresar}>
                        ← Volver
                    </Text>
                </TouchableOpacity>
            </View>
                <View style={estilos.card}>
                <View style={estilos.cardContent}>
                    <View style={estilos.imageContainer}>
                        <Image
                            source={require('../../assets/asuario.png')}
                            style={estilos.userImage}
                        />
                    </View>
                    <View style={estilos.infoContainer}>
                        <Text style={estilos.nombre}>
                            {empleado.nombre} {empleado.apellido_p}
                        </Text>
                        <Text style={estilos.info}>
                            Área: {empleado.area}
                        </Text>
                        <Text style={estilos.info}>
                            Turno: {empleado.turno}
                        </Text>
                        <Text style={estilos.info}>
                            Salario diario: ${empleado.salarioDiario}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={estilos.filaTarjetas}>
                <View style={[estilos.tarjetaEstadistica, estilos.tarjetaGeneral]}>
                    <Text style={estilos.tituloTarjeta}>
                        Nomina
                    </Text>
                    {nomina.data ? (
                        <>
                            <View style={estilos.contenedorValor}>
                                <Text style={estilos.valorPrincipal}>
                                    ${nomina.data.total.toFixed(2)}
                                </Text>
                            </View>
                            <Text style={estilos.detalleTarjeta}>
                                {nomina.data.diasTrabajados} dias trabajados
                            </Text>
                        </>
                    ) : (
                        <Text style={estilos.vacio}>
                            Sin datos
                        </Text>
                    )}
                </View>
                <View style={[estilos.tarjetaEstadistica, estilos.tarjetaGeneral]}>
                    <Text style={estilos.tituloTarjeta}>
                        Asistencia
                    </Text>
                    {asistenciaEmpleado.data ? (
                        <>
                            <View style={estilos.contenedorValor}>
                                <Text style={estilos.valorPrincipal}>
                                    {asistenciaEmpleado.data.total_asistencias}
                                </Text>
                            </View>
                            <Text style={estilos.detalleTarjeta}>
                                Total de asistencias
                            </Text>
                        </>
                    ) : (
                        <Text style={estilos.vacio}>
                            Sin datos
                        </Text>
                    )}
                </View>
            </View>
            <View style={estilos.filaTarjetas}>
                <View style={[estilos.tarjetaEstadistica, estilos.tarjetaGeneral]}>
                    <Text style={estilos.tituloTarjeta}>
                        Produccion</Text>
                    {unidades.data?.total && unidades.data.total.length > 0 ? (
                        <>
                            <View style={estilos.contenedorValor}>
                                <Text style={estilos.valorPrincipal}>
                                    {unidades.data.total[0]?.total_producido || 0}
                                </Text>
                            </View>
                            <Text style={estilos.detalleTarjeta}>
                                Unidades totales
                            </Text>
                        </>
                    ) : (
                        <Text style={estilos.vacio}>
                            Sin datos</Text>
                    )}
                </View>
                <View style={[estilos.tarjetaEstadistica, estilos.tarjetaGeneral]}>
                    <Text style={estilos.tituloTarjeta}>
                        Horas</Text>
                    {horas.data.length > 0 ? (
                        <>
                            <View style={estilos.contenedorValor}>
                                <Text style={estilos.valorPrincipal}>
                                    {horas.data.reduce((total, item) => total + (item.a_horasTrabajadas || 0), 0).toFixed(1)}
                                </Text>
                            </View>
                            <Text style={estilos.detalleTarjeta}>
                                Horas totales
                            </Text>
                        </>
                    ) : (
                        <Text style={estilos.vacio}>
                            Sin datos
                        </Text>
                    )}
                </View>
            </View>
            <View style={estilos.seccionDetalle}>
                <View style={estilos.encabezadoSeccion}>
                    <Text style={estilos.tituloSeccion}>
                        Reporte de asistencia
                    </Text>
                    <Text style={estilos.contadorSeccion}>
                        ({reporteAsistencia.data?.total || 0})
                    </Text>
                </View>
                {reporteAsistencia.data?.data && reporteAsistencia.data.data.length > 0 ? (
                    reporteAsistencia.data.data.slice(0, 5).map((item, index) => (
                        <View key={index} style={estilos.filaDetalle}>
                            <View style={estilos.contenedorFecha}>
                                <Text style={estilos.fecha}>
                                    {item.a_fecha}
                                </Text>
                            </View>
                            <View style={estilos.contenedorGeneral}>
                                <Text style={estilos.general}>
                                    {item.a_turno}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={estilos.vacio}>
                        Sin registros
                    </Text>
                )}
            </View>
            <View style={estilos.seccionDetalle}>
                <View style={estilos.encabezadoSeccion}>
                    <Text style={estilos.tituloSeccion}>
                        Dias trabajados
                    </Text>
                    <Text style={estilos.contadorSeccion}>
                        ({dias.data.length})
                    </Text>
                </View>
                {dias.data.length > 0 ? (
                    dias.data.slice(0, 5).map((item, index) => (
                        <View key={index} style={estilos.filaDetalle}>
                            <View style={estilos.contenedorFecha}>
                                <Text style={estilos.fecha}>
                                    {item.a_fecha}
                                </Text>
                            </View>
                            <View style={estilos.contenedorGeneral}>
                                <Text style={estilos.general}>
                                    {item.a_horaEntrada?.substring(0, 5) || 'N/A'} - {item.a_horaSalida?.substring(0, 5) || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={estilos.vacio}>
                        Sin registros</Text>
                )}
            </View>
            <View style={estilos.seccionDetalle}>
                <View style={estilos.encabezadoSeccion}>
                    <Text style={estilos.tituloSeccion}>
                        Reporte de produccion
                    </Text>
                    <Text style={estilos.contadorSeccion}>
                        ({produccion.data.length})
                    </Text>
                </View>
                {produccion.data.length > 0 ? (
                    produccion.data.slice(0, 5).map((item, index) => (
                        <View key={index} style={estilos.filaDetalle}>
                            <View style={estilos.contenedorFecha}>
                                <Text style={estilos.fecha}>{item.p_fecha}</Text>
                            </View>
                            <View style={estilos.contenedorGeneral}>
                                <Text style={estilos.general}>
                                    {item.p_unidadesProducidas} unidades
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={estilos.vacio}>
                        Sin registros</Text>
                )}
            </View>
        </ScrollView>
    );
};

const estilos = StyleSheet.create({
    raiz: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    botonRegresar: {
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        top: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    textoBotonRegresar: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#266BAB',
        borderRadius: 16,
        padding: 0,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        top: 34
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    imageContainer: {
        width: 120,
        height: '100%',
        backgroundColor: '#f3f6fcff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    infoContainer: {
        flex: 1,
        padding: 15,
        gap: 6,
    },
    nombre: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffffff',
        marginBottom: 4,
    },
    info: {
        fontSize: 14,
        color: '#ffffffff',
        opacity: 0.9,
    },
    userImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
    },
    filaTarjetas: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        top: 34
    },
    tarjetaEstadistica: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        minHeight: 120,
        justifyContent: 'space-between',
    },
    tarjetaGeneral: {
        backgroundColor: '#EAF3FA',
        borderLeftWidth: 4,
        borderLeftColor: '#2B79C2',
    },
    tituloTarjeta: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    contenedorValor: {
        alignItems: 'center',
        marginVertical: 8,
    },
    valorPrincipal: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    detalleTarjeta: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    seccionDetalle: {
        backgroundColor: 'white',
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        top: 34
    },
    encabezadoSeccion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tituloSeccion: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A237E',
    },
    contadorSeccion: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    filaDetalle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    contenedorFecha: {
        flex: 1,
    },
    contenedorGeneral: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    fecha: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    general: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000000ff',
    },
    vacio: {
        color: '#999',
        fontStyle: 'italic',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
});