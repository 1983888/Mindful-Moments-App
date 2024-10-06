import React, {useColorScheme} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';
import {default as Icon} from 'react-native-vector-icons/MaterialIcons';
/**
 * Tool is a component used to display icons and text for user interaction and navigation inside a Bar Component.
 * @see Bar
 * @param props
 * @constructor
 */
const Tool = ({title, icon, active}) => {
  let colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    toolText: {
      fontSize: 10,
      color: colorScheme === 'light' ? '#2B2B2B' : '#F5F5F5',
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: 'transparent',
    },
    toolContent: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    active: {
      // Add a top border to the active tool
      borderBottomWidth: 1,
      borderBottomColor: 'blue',
    },
  });
  if (active) {
    return (
      <View style={styles.toolContent}>
        <Icon
          name={icon}
          size={25}
          color={colorScheme === 'light' ? '#2B2B2B' : '#F5F5F5'}
        />
        <View>
          <Text style={[styles.toolText, styles.active]}>{title}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.toolContent}>
      <Icon
        name={icon}
        size={25}
        color={colorScheme === 'light' ? '#2B2B2B' : '#F5F5F5'}
      />
      <Text style={styles.toolText}>{title}</Text>
    </View>
  );
};

export default Tool;
