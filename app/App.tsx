import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeEmpleados } from './src/screens/HomeEmpleados';
import { EmpleadosScreens } from './src/screens/EmpleadosScreens';
import { Empleado } from './src/interfaces/empleadosInterface';

export type RootStackParamList = {
  HomeEmpleados: undefined;
  EmpleadosScreens: { empleado: Empleado };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeEmpleados"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F5F7FA' }
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
    </NavigationContainer>
  );
}