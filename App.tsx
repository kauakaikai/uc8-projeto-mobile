import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PilhaPets } from './src/navegacao/pilhaspets';
import type { RotasDasAbas } from './src/navegacao/tipos';
import { TelaSobre } from './src/telas/TelaSobre';

const Abas = createBottomTabNavigator<RotasDasAbas>();

export default function App() {
  return (
    <NavigationContainer>
      <Abas.Navigator>
        <Abas.Screen name="AbaPets" component={PilhaPets} options={{ title: 'Pets', headerShown: false }} />
        <Abas.Screen name="AbaSobre" component={TelaSobre} options={{ title: 'Sobre' }} />
      </Abas.Navigator>
    </NavigationContainer>
  );
}