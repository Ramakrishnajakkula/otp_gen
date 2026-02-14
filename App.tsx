import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider } from './src/context/SessionProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SessionProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      <AppNavigator />
    </SessionProvider>
  );
}
