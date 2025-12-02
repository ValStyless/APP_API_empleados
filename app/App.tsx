import React, { ReactNode } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeEmpleados } from './src/screens/HomeEmpleados';
import { EmpleadosScreens } from './src/screens/EmpleadosScreens';
import { CreateEmpleadoDto } from './src/interfaces/empleadosInterface';

export type RootStackParamList = {
    HomeEmpleados: undefined;
    EmpleadosScreens: { empleado: CreateEmpleadoDto };
};

const Stack = createStackNavigator<RootStackParamList>();

interface AppStateProps {
    children: ReactNode;
}

const AppState: React.FC<AppStateProps> = ({ children }) => {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
};

const App = () => {
    return (
        <NavigationContainer>
            <AppState>
                <Stack.Navigator 
                    screenOptions={{ 
                        headerShown: false 
                    }}
                >
                    <Stack.Screen 
                        name="HomeEmpleados" 
                        component={HomeEmpleados} 
                    />
                    <Stack.Screen 
                        name="EmpleadosScreens" 
                        component={EmpleadosScreens} 
                    />
                </Stack.Navigator>
            </AppState>
        </NavigationContainer>
    );
};

export default App;
