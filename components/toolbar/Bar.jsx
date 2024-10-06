import React from 'react-native';
import {View, StyleSheet, useColorScheme} from 'react-native';

const Bar = ({children, alignment}) => {
  // Listen for a change in color scheme
  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    topContainer: {
      elevation: 5,
      height: '8%',
      shadowOffset: {width: 0, height: -1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      top: 0,
    },
    bottomContainer: {
      bottom: 0,
      elevation: 5,
      // Make a shadow appear at the top of the bar
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    container: {
      position: 'absolute',
      paddingTop: 5,
      paddingBottom: 5,
      backgroundColor: colorScheme === 'light' ? '#F5F5F5' : '#2B2B2B',
      shadowColor: 'black',
      width: '100%',
    },
    childrenContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
  });

  if (alignment === 'top') {
    return (
      <View style={[styles.container, styles.topContainer]}>{children}</View>
    );
  } else if (alignment === 'bottom') {
    return (
      <View style={[styles.container, styles.bottomContainer]}>
        {/* Create a column for each child which is equal in size (Horizontally) to take up the full bar */}

        <View style={styles.childrenContainer}>{children}</View>
      </View>
    );
  }

  return <View styles={styles.container}>{children}</View>;
};

export default Bar;
