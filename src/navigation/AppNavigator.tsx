import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/LoginScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { SessionScreen } from '../screens/SessionScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

export const AppNavigator = () => (
  <NavigationContainer theme={navTheme}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
