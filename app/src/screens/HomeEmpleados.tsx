import React, { useEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useEmpleados } from '../hooks/useEmpleados';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    StyleSheet, 
    Image, 
    RefreshControl,
    Dimensions 
} from 'react-native';
import { Empleado } from '../interfaces/empleadosInterface';

type RootStackParamList = {
    HomeEmpleados: undefined;
    EmpleadosScreens: { empleado: Empleado };
};

type Props = StackScreenProps<RootStackParamList, 'HomeEmpleados'>;

const { width } = Dimensions.get('window');

export const HomeEmpleados = ({ navigation }: Props) => {
    const { empleados, isLoading, totalEmpleados, refreshEmpleados, hasMore, loadEmpleados } = useEmpleados(10);
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        if (empleados.length > 0) {
            console.log('Primer empleado recibido:', {
                id: empleados[0].id_empleado,
                nombre: empleados[0].nombre,
                activo: empleados[0].activo,
                tipoActivo: typeof empleados[0].activo,
                salarioDiario: empleados[0].salarioDiario,
                tipoSalario: typeof empleados[0].salarioDiario
            });
        }
    }, [empleados]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshEmpleados();
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            loadEmpleados();
        }
    };

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        
        if (isCloseToBottom && hasMore && !isLoading) {
            handleLoadMore();
        }
    };

    if (isLoading && empleados.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#266BAB" />
                <Text style={styles.loadingText}>Cargando empleados...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Lista de los empleados</Text>
                <Text style={styles.subtitle}>
                    {totalEmpleados} empleados registrados
                </Text>
            </View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing || isLoading} 
                        onRefresh={onRefresh}
                        colors={['#266BAB']}
                        tintColor="#266BAB"
                    />
                }
                onScroll={handleScroll}
                scrollEventThrottle={400}
                showsVerticalScrollIndicator={true}
            >
                {empleados.map((empleado) => {
                    const { parseBoolean } = require('../interfaces/empleadosInterface');
                    const salario = typeof empleado.salarioDiario === 'string'
                        ? parseFloat(empleado.salarioDiario)
                        : empleado.salarioDiario;
                    const activo = parseBoolean(empleado.activo);

                    return (
                        <TouchableOpacity
                            key={empleado.id_empleado}
                            style={styles.card}
                            onPress={() => navigation.navigate('EmpleadosScreens', { empleado: {
                                ...empleado,
                                salarioDiario: salario,
                                activo: activo
                            }})}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardContent}>
                                <Image
                                    source={require('../../assets/asuario.png')}
                                    style={styles.avatar}
                                    onError={() => console.warn('Imagen de usuario no encontrada en assets/asuario.png')}
                                />
                                <View style={styles.infoContainer}>
                                    <Text style={styles.name}>
                                        {empleado.nombre} {empleado.apellido_p} {empleado.apellido_m}
                                    </Text>
                                    <View style={styles.detailsRow}>
                                        <View style={[styles.chip, styles.areaChip]}>
                                            <Text style={styles.chipText}>{empleado.area}</Text>
                                        </View>
                                        <View style={[styles.chip, styles.turnoChip]}>
                                            <Text style={styles.chipText}>{empleado.turno}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailText}>
                                            Salario: ${salario?.toFixed(2) || '0.00'} / día
                                        </Text>
                                    </View>
                                    <View style={styles.statusContainer}>
                                        <View style={[
                                            styles.statusDot,
                                            { backgroundColor: activo ? '#4CAF50' : '#F44336' }
                                        ]} />
                                        <Text style={styles.statusText}>
                                            {activo ? 'Activo' : 'Inactivo'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
                                {hasMore && (
                    <View style={styles.loadingMore}>
                        <ActivityIndicator size="small" color="#266BAB" />
                        <Text style={styles.loadingMoreText}>Cargando mas empleados...</Text>
                    </View>
                )}                
                <View style={{ height: 50 }} />
            </ScrollView>
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
    header: {
        backgroundColor: '#266BAB',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f2f2f2ff',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: '#E3F2FD',
        backgroundColor: '#E3F2FD',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A237E',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    areaChip: {
        backgroundColor: '#E3F2FD',
    },
    turnoChip: {
        backgroundColor: '#E8F5E9',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A237E',
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    loadingMore: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingMoreText: {
        marginLeft: 12,
        color: '#666',
        fontSize: 14,
    },
});