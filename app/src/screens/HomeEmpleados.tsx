import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useEmpleados } from '../hooks/useEmpleados';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';

type RootStackParamList = {
    HomeEmpleados: undefined;
    EmpleadosScreens: { empleado: any };
};

type Props = StackScreenProps<RootStackParamList, 'HomeEmpleados'>;

export const HomeEmpleados = ({ navigation }: Props) => {
    const { empleados, isLoading, LoadEmpleados } = useEmpleados();

    if (isLoading && empleados.length === 0) {
        return (
            <View style={style.root}>
                <ActivityIndicator size="large" color="#0972C8" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={style.header}>
                <Text style={style.title}>Lista de empleados</Text>
            </View>
            <FlatList
                data={empleados}
                keyExtractor={(item) => String(item.id_empleado)}
                contentContainerStyle={{ padding: 12 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={style.card}
                        onPress={() => navigation.navigate('EmpleadosScreens', { empleado: item })}
                        activeOpacity={0.8}
                    >
                        <View style={style.cardContent}>
                            <View style={style.imageContainer}>
                                <Image
                                    source={require('../../assets/asuario.png')}
                                    style={style.userImage}
                                />
                            </View>
                            <View style={style.infoContainer}>
                                <Text style={style.nombre}>
                                    {item.nombre} {item.apellido_p}
                                </Text>
                                <Text style={style.info}>
                                    Área: {item.area}
                                </Text>
                                <Text style={style.info}>
                                    Turno: {item.turno}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View>
                    </View>
                )}
                onRefresh={LoadEmpleados}
                refreshing={isLoading}
            />
        </View>
    );
}

const style = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        backgroundColor: '#000000ff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        top:34
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#266BAB',
        borderRadius: 10,
        padding: 0,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
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
    },
    infoContainer: {
        flex: 1,
        padding: 15,
        gap: 6,
    },
    nombre: {
        fontSize: 25,
        fontWeight: '700',
        color: '#ffffffff',
    },
    info: {
        fontSize: 14,
        color: '#ffffffff',
    },
    userImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
    },
});