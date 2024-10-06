import React from 'react';
import {View, Text, useColorScheme} from 'react-native';
import {StyleSheet} from 'react-native';

const CustomHeader = ({navigation, route, options, back}) => {
  const colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    header: {
      backgroundColor: colorScheme === 'light' ? '#F5F5F5' : '#2B2B2B',
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      // Add a shadow to the bottom
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'light' ? '#333' : '#EEE',
    },
  });

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{route.name}</Text>
    </View>
  );
};

export default CustomHeader;
