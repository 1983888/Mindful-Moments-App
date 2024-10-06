import 'react-native-gesture-handler';
import React from 'react';
import Bar from './components/toolbar/Bar';
import {default as Tool} from './components/toolbar/Tool';
import {TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CustomHeader from './components/CustomHeader';
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';

function App() {
  const Stack = createStackNavigator();

  // State to keep track of active tool
  const [active, setActive] = React.useState('Map');

  // Navigation Reference
  const navigationRef = React.useRef();

  // Handle tool press
  const handleToolPress = toolTitle => {
    setActive(toolTitle);
    navigationRef.current?.navigate(toolTitle);
  };

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={'Map'}
          screenOptions={{
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            gestureDirection: 'horizontal',
            header: CustomHeader,
            headerMode: 'screen',
          }}>
          <Stack.Screen name={'Map'} component={MapScreen} />
          <Stack.Screen name={'Home'} component={HomeScreen} />
          <Stack.Screen name={'Settings'} component={SettingsScreen} />
        </Stack.Navigator>
        <Bar alignment={'bottom'}>
          {/* Touchable Opacity creates a touchable button */}
          <TouchableOpacity onPress={() => handleToolPress('Map')}>
            <Tool title={'Map'} icon={'map'} active={active === 'Map'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleToolPress('Home')}>
            <Tool title={'Home'} icon={'home'} active={active === 'Home'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleToolPress('Settings')}>
            <Tool
              title={'Settings'}
              icon={'settings'}
              active={active === 'Settings'}
            />
          </TouchableOpacity>
        </Bar>
      </NavigationContainer>
    </>
  );
}

export default App;
