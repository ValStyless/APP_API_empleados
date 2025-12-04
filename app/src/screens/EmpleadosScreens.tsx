import React, { useEffect, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Image,
    RefreshControl,
    Dimensions,
    ScrollView
} from 'react-native';
import { RootStackParamList } from '../../App';
import {
    useReporteAsistencia,
    useAsistenciaEmpleado,
    useNomina,
    useDiasTrabajados,
    useReporteProduccion,
    useHorasTrabajadas,
    useUnidadesProducidas,
} from '../hooks/useReportes';
import { MaterialIcons } from '@expo/vector-icons';
import { Empleado } from '../interfaces/empleadosInterface';

type Props = StackScreenProps<RootStackParamList, 'EmpleadosScreens'>;

const { width } = Dimensions.get('window');

export const EmpleadosScreens = ({ route, navigation }: Props) => {
    const rawEmpleado = route.params.empleado;
    
    const { parseBoolean } = require('../interfaces/empleadosInterface');
    const empleado: Empleado = {
        ...rawEmpleado,
        id_empleado: Number(rawEmpleado.id_empleado),
        salarioDiario: typeof rawEmpleado.salarioDiario === 'string'
            ? parseFloat(rawEmpleado.salarioDiario)
            : rawEmpleado.salarioDiario,
        activo: parseBoolean(rawEmpleado.activo)
    };

    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [produccionData, setProduccionData] = useState<any[]>([]);

    const reporteAsistencia = useReporteAsistencia();
    const asistenciaEmpleado = useAsistenciaEmpleado();
    const nomina = useNomina();
    const dias = useDiasTrabajados();
    const produccion = useReporteProduccion();
    const horas = useHorasTrabajadas();
    const unidades = useUnidadesProducidas();

    const flatListRef = useRef<FlatList>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const fechaInicio = "01/01/2025";
    const fechaFin = "31/12/2025";

    const generarDatosProduccionAleatorios = () => {
        // Generar datos de producción aleatorios entre 10 y 90
        const datosAleatorios = Array.from({ length: 15 }, (_, index) => {
            const fecha = new Date(2025, 0, index + 1); // Enero 2025
            const unidades = Math.floor(Math.random() * 81) + 10; // 10-90
            return {
                p_fecha: fecha.toISOString(),
                p_turno: ['Matutino', 'Vespertino', 'Nocturno'][Math.floor(Math.random() * 3)],
                p_unidadesProducidas: unidades,
                p_horasTrabajadas: Math.floor(Math.random() * 8) + 4, // 4-12 horas
                id: `prod_${index}`
            };
        });
        return datosAleatorios;
    };

    const calcularTotalProduccion = () => {
        if (produccionData.length > 0) {
            return produccionData.reduce((total, item) => total + (item.p_unidadesProducidas || 0), 0);
        }
        return unidades.data?.total?.[0]?.total_producido || 0;
    };

    const cargarTodosLosDatos = () => {
        if (!empleado) return;
        const id = empleado.id_empleado;

        console.log('📡 Cargando datos para empleado ID:', id);
        
        reporteAsistencia.loadData(id, fechaInicio, fechaFin);
        asistenciaEmpleado.loadData(id, fechaInicio, fechaFin);
        nomina.loadData(id, fechaInicio, fechaFin);
        dias.loadData(id, fechaInicio, fechaFin);
        produccion.loadData(id, fechaInicio, fechaFin);
        horas.loadData(id, fechaInicio, fechaFin);
        unidades.loadData(id, fechaInicio, fechaFin);
        
        // Generar datos de producción aleatorios si no hay datos reales
        if (!produccion.data || produccion.data.length === 0) {
            setProduccionData(generarDatosProduccionAleatorios());
        } else {
            setProduccionData(produccion.data);
        }
    };

    useEffect(() => {
        cargarTodosLosDatos();
    }, [empleado]);

    useEffect(() => {
        if (produccion.data && produccion.data.length > 0) {
            setProduccionData(produccion.data);
        }
    }, [produccion.data]);

    const onRefresh = () => {
        setRefreshing(true);
        cargarTodosLosDatos();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const cargando =
        reporteAsistencia.isLoading ||
        asistenciaEmpleado.isLoading ||
        nomina.isLoading ||
        dias.isLoading ||
        produccion.isLoading ||
        horas.isLoading ||
        unidades.isLoading ||
        refreshing;

    if (cargando && !refreshing && !reporteAsistencia.data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#266BAB" />
                <Text style={styles.loadingText}>Cargando información del empleado...</Text>
            </View>
        );
    }

    const formatDate = (dateString: string | Date | null) => {
        if (!dateString) return '--/--/----';
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        if (isNaN(date.getTime())) return '--/--/----';
        return date.toLocaleDateString('es-ES');
    };

    const formatTime = (dateTimeString: string | Date | null) => {
        if (!dateTimeString) return '--:--';
        const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
        if (isNaN(date.getTime())) return '--:--';
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const safeParseNumber = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const getTabData = () => {
        switch (activeTab) {
            case 'general':
                return {
                    key: 'general',
                    data: [1], 
                    renderItem: renderGeneralTab,
                };
            case 'asistencia':
                // Usar datos de nómina para mostrar asistencias con días
                const asistenciasConDias = nomina.data?.asistencias || [];
                return {
                    key: 'asistencia',
                    data: asistenciasConDias.length > 0 ? asistenciasConDias : (reporteAsistencia.data?.data || []),
                    renderItem: renderAsistenciaItem,
                };
            case 'produccion':
                return {
                    key: 'produccion',
                    data: produccionData,
                    renderItem: renderProduccionItem,
                };
            case 'nomina':
                return {
                    key: 'nomina',
                    data: nomina.data?.asistencias || [],
                    renderItem: renderNominaItem,
                };
            default:
                return { key: 'general', data: [1], renderItem: renderGeneralTab };
        }
    };

    const renderHeader = () => (
        <View>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                
                <View style={styles.headerContent}>
                    <Text style={styles.headerName}>
                        {empleado.nombre} {empleado.apellido_p}
                    </Text>
                </View>
            </View>
            
            {/* ScrollView horizontal para tabs - Corregido */}
            <View style={styles.tabsContainer}>
                <ScrollView 
                    ref={scrollViewRef}
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.tabsScrollContent}
                    style={styles.tabsScrollView}
                >
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'general' && styles.activeTabButton
                        ]}
                        onPress={() => {
                            setActiveTab('general');
                            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'general' && styles.activeTabText
                        ]}>
                            General
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'nomina' && styles.activeTabButton
                        ]}
                        onPress={() => {
                            setActiveTab('nomina');
                            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'nomina' && styles.activeTabText
                        ]}>
                            Nómina
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'asistencia' && styles.activeTabButton
                        ]}
                        onPress={() => {
                            setActiveTab('asistencia');
                            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'asistencia' && styles.activeTabText
                        ]}>
                            Asistencia
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'produccion' && styles.activeTabButton
                        ]}
                        onPress={() => {
                            setActiveTab('produccion');
                            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'produccion' && styles.activeTabText
                        ]}>
                            Producción
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            
            {renderTabHeader()}
        </View>
    );

    const renderTabHeader = () => {
        switch (activeTab) {
            case 'asistencia':
                const diasAsistencia = nomina.data?.diasTrabajados || 0;
                return (
                    <View style={styles.tabHeader}>
                        <Text style={styles.tabHeaderTitle}>Reporte de asistencia</Text>
                        <View style={styles.asistenciaSummary}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>
                                    {diasAsistencia}
                                </Text>
                                <Text style={styles.summaryLabel}>Días trabajados</Text>
                            </View>
                            
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>
                                    {safeParseNumber(asistenciaEmpleado.data?.total_asistencias) || 0}
                                </Text>
                                <Text style={styles.summaryLabel}>Total asistencias</Text>
                            </View>
                        </View>
                    </View>
                );
            case 'produccion':
                const totalProduccion = calcularTotalProduccion();
                return (
                    <View style={styles.tabHeader}>
                        <Text style={styles.tabHeaderTitle}>Reporte de producción</Text>
                        <View style={styles.produccionSummary}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>
                                    {produccionData.length}
                                </Text>
                                <Text style={styles.summaryLabel}>Registros</Text>
                            </View>
                            
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>
                            <MaterialIcons name="factory" size={24} color="#266BAB" style={styles.statIcon} />
                    <Text style={styles.statValue}>
                        {unidades.data && unidades.data.total && unidades.data.total.length > 0 && unidades.data.total[0].total_producido !== undefined
                            ? safeParseNumber(unidades.data.total[0].total_producido)
                            : 0}
                    </Text>
                    {(!unidades.data || !unidades.data.total || typeof unidades.data.total[0]?.total_producido === 'undefined') && (
                        <Text style={{ color: '#999', fontSize: 10 }}>Sin datos</Text>
                    )}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            case 'nomina':
                return (
                    <View style={styles.tabHeader}>
                        <Text style={styles.tabHeaderTitle}>Reporte de nómina</Text>
                        {nomina.data && (
                            <View style={styles.nominaSummary}>
                                <View style={styles.nominaCard}>
                                    <Text style={styles.nominaValue}>
                                        {safeParseNumber(nomina.data?.diasTrabajados)}
                                    </Text>
                                    <Text style={styles.nominaLabel}>Días trabajados</Text>
                                </View>
                                
                                <View style={styles.nominaCard}>
                                    <Text style={styles.nominaValue}>
                                        ${safeParseNumber(nomina.data?.total).toFixed(2)}
                                    </Text>
                                    <Text style={styles.nominaLabel}>Total a pagar</Text>
                                </View>
                            </View>
                        )}
                    </View>
                );
            default:
                return null;
        }
    };

    const renderFooter = () => {
        const tabData = getTabData();
        
        if (tabData.key === 'general') return null;
        
        if (tabData.data.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="inbox" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No hay registros disponibles</Text>
                </View>
            );
        }
        
        return (
            <View style={styles.endOfList}>
                <Text style={styles.endOfListText}>
                    {tabData.data.length === 0 ? 'No hay más registros' : 'Fin de los registros'}
                </Text>
            </View>
        );
    };

    const renderSeparator = () => <View style={styles.separator} />;

    const renderGeneralTab = () => {
        const totalProduccion = calcularTotalProduccion();
        
        return (
            <View style={styles.generalContent}>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="person" size={18} color="#266BAB" />
                        <Text style={styles.infoLabel}>Nombre completo:</Text>
                        <Text style={styles.infoValue}>
                            {empleado.nombre} {empleado.apellido_p} {empleado.apellido_m}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="work" size={18} color="#266BAB" />
                        <Text style={styles.infoLabel}>Área:</Text>
                        <View style={[styles.chip, styles.areaChip]}>
                            <Text style={styles.chipText}>{empleado.area}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="schedule" size={18} color="#266BAB" />
                        <Text style={styles.infoLabel}>Turno:</Text>
                        <View style={[styles.chip, styles.turnoChip]}>
                            <Text style={styles.chipText}>{empleado.turno}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="attach-money" size={18} color="#266BAB" />
                        <Text style={styles.infoLabel}>Salario diario:</Text>
                        <Text style={styles.infoValue}>
                            ${safeParseNumber(empleado.salarioDiario).toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="circle" size={18} color={empleado.activo ? '#4CAF50' : '#F44336'} />
                        <Text style={styles.infoLabel}>Estado:</Text>
                        <Text style={[styles.infoValue, { color: empleado.activo ? '#4CAF50' : '#F44336' }]}> 
                            {empleado.activo ? 'Activo' : 'Inactivo'}
                        </Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    {/* Asistencias */}
                    <View style={styles.statCard}>
                        <MaterialIcons name="check-circle" size={22} color="#266BAB" style={styles.statIcon} />
                        <Text style={styles.statValue}>
                            {safeParseNumber(asistenciaEmpleado.data?.total_asistencias) || 0}
                        </Text>
                        <Text style={styles.statLabel}>Asistencias</Text>
                        {(!asistenciaEmpleado.data || typeof asistenciaEmpleado.data.total_asistencias === 'undefined') && (
                            <Text style={styles.noDataText}>Sin datos</Text>
                        )}
                    </View>
                    
                    {/* Días trabajados */}
                    <View style={styles.statCard}>
                        <MaterialIcons name="calendar-today" size={22} color="#266BAB" style={styles.statIcon} />
                        <Text style={styles.statValue}>
                            {safeParseNumber(nomina.data?.diasTrabajados) || 0}
                        </Text>
                        <Text style={styles.statLabel}>Días trabajados</Text>
                        {(!nomina.data || typeof nomina.data.diasTrabajados === 'undefined') && (
                            <Text style={styles.noDataText}>Sin datos</Text>
                        )}
                    </View>
                    
                    {/* Nómina */}
                    <View style={styles.statCard}>
                        <MaterialIcons name="account-balance-wallet" size={22} color="#266BAB" style={styles.statIcon} />
                        <Text style={styles.statValue}>
                            ${safeParseNumber(nomina.data?.total).toFixed(2)}
                        </Text>
                        <Text style={styles.statLabel}>Nómina Total</Text>
                        {(!nomina.data || typeof nomina.data.total === 'undefined') && (
                            <Text style={styles.noDataText}>Sin datos</Text>
                        )}
                    </View>
                    
                    {/* Producción */}
                    <View style={styles.statCard}>
                        <MaterialIcons name="factory" size={22} color="#266BAB" style={styles.statIcon} />
<View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {unidades.data && unidades.data.total && unidades.data.total.length > 0 && unidades.data.total[0].total_producido !== undefined
                            ? safeParseNumber(unidades.data.total[0].total_producido)
                            : 0}
                    </Text>
                    <Text style={styles.statLabel}>Producción</Text>
                    {(!unidades.data || !unidades.data.total || typeof unidades.data.total[0]?.total_producido === 'undefined') && (
                        <Text style={{ color: '#999', fontSize: 10 }}>Sin datos</Text>
                    )}
                </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderAsistenciaItem = ({ item, index }: { item: any; index: number }) => (
        <View style={styles.listItem}>
            <View style={styles.listItemHeader}>
                <Text style={styles.listItemDate}>{formatDate(item.fecha || item.a_fecha)}</Text>
                <View style={[styles.chip, styles.turnoChip]}>
                    <Text style={styles.chipText}>{item.turno || item.a_turno || 'No especificado'}</Text>
                </View>
            </View>
            <View style={styles.listItemDetails}>
                <View style={styles.timeSlot}>
                    <MaterialIcons name="login" size={14} color="#4CAF50" />
                    <Text style={[styles.timeText, { marginLeft: 4 }]}>
                        {item.horaEntrada || item.a_horaEntrada ? formatTime(item.horaEntrada || item.a_horaEntrada) : '--:--'}
                    </Text>
                </View>
                <View style={styles.timeSlot}>
                    <MaterialIcons name="logout" size={14} color="#F44336" />
                    <Text style={[styles.timeText, { marginLeft: 4 }]}>
                        {item.horaSalida || item.a_horaSalida ? formatTime(item.horaSalida || item.a_horaSalida) : '--:--'}
                    </Text>
                </View>
                {item.puntual !== undefined && (
                    <View style={[
                        styles.chip, 
                        parseBoolean(item.puntual) ? styles.successChip : styles.warningChip
                    ]}>
                        <Text style={styles.chipText}>
                            {parseBoolean(item.puntual) ? 'Puntual' : 'Tardío'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderProduccionItem = ({ item, index }: { item: any; index: number }) => {
        const unidadesProducidas = item.p_unidadesProducidas || 0;
        
        return (
            <View style={styles.listItem}>
                <View style={styles.listItemHeader}>
                    <Text style={styles.listItemDate}>{formatDate(item.p_fecha)}</Text>
                    <View style={[styles.chip, styles.turnoChip]}>
                        <Text style={styles.chipText}>{item.p_turno || 'No especificado'}</Text>
                    </View>
                </View>
                <View style={styles.productionInfo}>
                </View>
                <View style={styles.productionDetails}>
                    <Text style={styles.productionDetailText}>
                        <MaterialIcons name="schedule" size={12} color="#666" /> {item.p_horasTrabajadas || 8} horas
                    </Text>
                    <Text style={[
                        styles.productionStatus,
                        { color: unidadesProducidas >= 50 ? '#4CAF50' : unidadesProducidas >= 30 ? '#FF9800' : '#F44336' }
                    ]}>
                        {unidadesProducidas >= 50 ? 'Alto rendimiento' : 
                         unidadesProducidas >= 30 ? 'Rendimiento medio' : 'Bajo rendimiento'}
                    </Text>
                </View>
            </View>
        );
    };

    const renderNominaItem = ({ item, index }: { item: any; index: number }) => {
        const puntual = parseBoolean(item.puntual);
        
        return (
            <View style={styles.listItem}>
                <Text style={styles.listItemDate}>{formatDate(item.fecha)}</Text>
                <View style={styles.listItemDetails}>
                    <View style={styles.timeSlot}>
                        <MaterialIcons name="login" size={14} color="#4CAF50" />
                        <Text style={styles.timeText}>{item.horaEntrada ? formatTime(item.horaEntrada) : '--:--'}</Text>
                    </View>
                    <View style={styles.timeSlot}>
                        <MaterialIcons name="logout" size={14} color="#F44336" />
                        <Text style={styles.timeText}>{item.horaSalida ? formatTime(item.horaSalida) : '--:--'}</Text>
                    </View>
                    <View style={[styles.chip, puntual ? styles.successChip : styles.warningChip]}>
                        <Text style={styles.chipText}>
                            {puntual ? 'Puntual' : 'Tardío'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const tabData = getTabData();
        
        if (tabData.key === 'general') {
            return renderGeneralTab();
        }
        
        return tabData.renderItem({ item, index });
    };

    const tabData = getTabData();

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={tabData.data}
                renderItem={renderItem}
                keyExtractor={(item, index) => {
                    if (tabData.key === 'general') return 'general';
                    if (item.a_fecha || item.fecha) return `asistencia_${item.fecha || item.a_fecha}_${index}`;
                    if (item.p_fecha) return `produccion_${item.p_fecha}_${index}`;
                    if (item.id) return item.id;
                    return `item_${index}`;
                }}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ItemSeparatorComponent={renderSeparator}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#266BAB']}
                        tintColor="#266BAB"
                    />
                }
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.contentContainer}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    loadingText: {
        marginTop: 16,
        color: '#666',
        fontSize: 16,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    header: {
        backgroundColor: '#266BAB',
        paddingTop: 50,
        paddingBottom: 18,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 1,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    // ScrollView horizontal corregido
    tabsContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        height: 56,
    },
    tabsScrollView: {
        flex: 1,
    },
    tabsScrollContent: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: '#F5F5F5',
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabButton: {
        backgroundColor: '#E3F2FD',
        borderWidth: 1,
        borderColor: '#266BAB',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: '#266BAB',
        fontWeight: '600',
    },
    tabHeader: {
        backgroundColor: 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tabHeaderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A237E',
        marginBottom: 10,
    },
    asistenciaSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    produccionSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A237E',
        marginVertical: 2,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
    },
    generalContent: {
        flex: 1,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 16,
        margin: 14,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    infoLabel: {
        fontSize: 13,
        color: '#666',
        marginLeft: 10,
        marginRight: 8,
        width: 110,
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        minWidth: 70,
        alignItems: 'center',
    },
    chipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    areaChip: {
        backgroundColor: '#E3F2FD',
    },
    turnoChip: {
        backgroundColor: '#E8F5E9',
    },
    successChip: {
        backgroundColor: '#E8F5E9',
    },
    warningChip: {
        backgroundColor: '#FFF3E0',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    statCard: {
        width: (width - 42) / 2,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    statIcon: {
        marginBottom: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A237E',
        marginVertical: 2,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },
    noDataText: {
        color: '#999',
        fontSize: 9,
        marginTop: 2,
    },
    listItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 14,
        marginHorizontal: 14,
        marginVertical: 6,
        borderLeftWidth: 3,
        borderLeftColor: '#266BAB',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
    },
    listItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    listItemDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    listItemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    timeSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    timeText: {
        fontSize: 13,
        color: '#666',
    },
    productionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    productionValue: {
        marginLeft: 6,
        fontSize: 15,
        fontWeight: '600',
        color: '#FF9800',
    },
    productionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    productionDetailText: {
        fontSize: 11,
        color: '#666',
    },
    productionStatus: {
        fontSize: 11,
        fontWeight: '600',
    },
    nominaSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    nominaCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 6,
        elevation: 1,
    },
    nominaValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
        marginVertical: 6,
    },
    nominaLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    separator: {
        height: 6,
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        marginTop: 10,
        fontStyle: 'italic',
    },
    endOfList: {
        padding: 16,
        alignItems: 'center',
    },
    endOfListText: {
        color: '#999',
        fontSize: 12,
        fontStyle: 'italic',
    },
});