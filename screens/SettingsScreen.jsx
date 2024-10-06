import React, {useState} from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {PermissionsAndroid} from 'react-native';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const toggleNotifications = async () => {
    setNotificationsEnabled(prev => !prev);

    if (!notificationsEnabled) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app would like to send you notifications.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
          // Handle the case where the permission is denied
          // For example, show a message to the user
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const openPrivacyPolicy = () => {
    // Open the privacy policy page or website
    Linking.openURL('https://example.com/privacy-policy');
  };

  const changeTheme = () => {
    // Implement logic to change the app theme
    // For demonstration purposes, let's log a message
    console.log('Changing app theme...');
  };

  const changeLanguage = () => {
    // Navigate to the language selection screen
    // For demonstration purposes, let's log a message
    console.log('Navigating to language selection screen...');
  };

  const openAboutPage = () => {
    // Navigate to the about page
    // For demonstration purposes, let's log a message
    console.log('Navigating to about page...');
  };

  const openHelpAndFeedback = () => {
    // Navigate to the help and feedback screen
    // For demonstration purposes, let's log a message
    console.log('Navigating to help and feedback screen...');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={toggleNotifications}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={openPrivacyPolicy}>
        <Text style={styles.settingText}>Privacy Policy</Text>
        <Text style={styles.arrow} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={changeTheme}>
        <Text style={styles.settingText}>Theme</Text>
        <Text style={styles.arrow} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={changeLanguage}>
        <Text style={styles.settingText}>Language</Text>
        <Text style={styles.arrow} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={openAboutPage}>
        <Text style={styles.settingText}>About</Text>
        <Text style={styles.arrow} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={openHelpAndFeedback}>
        <Text style={styles.settingText}>Help & Feedback</Text>
        <Text style={styles.arrow} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: '#aaa',
  },
});

export default SettingsScreen;
