import React, {useEffect, useState} from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker} from 'react-native-maps';
import Modal from 'react-native-modal';
import {useNavigation} from '@react-navigation/native';
import {Platform, PushNotificationAndroid} from 'react-native';
import PushNotification from 'react-native-push-notification';

const MapScreen = () => {
  const [location, setLocation] = useState({});
  const [initialRegion, setInitialRegion] = useState({});
  const [foodBanks, setFoodBanks] = useState([]);
  const [selectedFoodBank, setSelectedFoodBank] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);


  const navigation = useNavigation();

  const handleLocationChange = newLocation => {
    setLocation(newLocation);
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app requires access to your location to provide you with up-to-date location information!',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
        startWatching();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const requestNotificationPermission = async () => {
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
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getFoodBanks = async () => {
    try {
      const response = await fetch(
        'https://www.givefood.org.uk/api/2/foodbanks/',
      );
      let data = await response.json();
      // Filter the data to include only foodbanks in Scotland
      data = data.filter(bank => bank.country === 'Scotland');

      // For each foodbank, separate lat_lng into latitude and longitude
      for (const bank in data) {
        // Separate on the comma
        let parts = data[bank].lat_lng.split(',');
        let latitude = parts[0];
        let longitude = parts[1];
        data[bank].latitude = latitude;
        data[bank].longitude = longitude;
      }
      setFoodBanks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const startWatching = () => {
    Geolocation.getCurrentPosition(
      pos => {
        setInitialRegion(pos);
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 1,
      },
    );
    Geolocation.watchPosition(
      position => {
        handleLocationChange(position);
        checkNearbyFoodBanks(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 1,
      },
    );
  };

  const checkNearbyFoodBanks = (latitude, longitude) => {
    foodBanks.forEach(foodBank => {
      const distance = calculateDistance(
        latitude,
        longitude,
        parseFloat(foodBank.latitude),
        parseFloat(foodBank.longitude),
      );
      if (distance < 500) {
        sendNotification(foodBank);
      }
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance * 1000; // Convert to meters
  };

  const toRadians = degrees => {
    return degrees * (Math.PI / 180);
  };

  // Function to send push notification
  const sendNotification = async foodBank => {
    if (Platform.OS === 'android') {
      // Create the notification channel
      PushNotification.createChannel(
        {
          channelId: 'default-channel-id', // Channel ID
          channelName: 'Default Channel', // Channel name
          channelDescription: 'Default notification channel', // Channel description
          importance: 4, // Notification importance (default)
          vibrate: true, // Vibration enabled
        },
        // created => console.log(`createChannel returned '${created}'`), // Callback function
      );

      // Send the local notification
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: 'Nearby Food Bank',
        message: `You are near ${foodBank.name}`,
      });
    }
  };

  if (firstLoad) {
    Alert.alert('Showing food banks near you');
    setFirstLoad(false);
  }

  useEffect(() => {
    getFoodBanks();
  }, []); // Empty dependency array to run only once on component mount

  useEffect(() => {
    const handlePermissions = async () => {
      if (foodBanks.length > 0) {
        await requestLocationPermission();
        await requestNotificationPermission();
      }
    };

    handlePermissions();
  }, [foodBanks]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: initialRegion.coords?.latitude || 37.78825,
          longitude: initialRegion.coords?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        {foodBanks.length > 0 &&
          foodBanks.map((foodBank, index) => {
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: parseFloat(foodBank?.latitude),
                  longitude: parseFloat(foodBank?.longitude),
                }}
                title={foodBank.name}
                description={foodBank.address}
                icon={foodBank.icon}
                onPress={() => {
                  setSelectedFoodBank(foodBank);
                  setModalVisible(true);
                }}
              />
            );
          })}
      </MapView>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          {selectedFoodBank && (
            <>
              <Text style={styles.modalText}>
                Name: {selectedFoodBank.name}
              </Text>
              <Text style={styles.modalText}>
                Address: {selectedFoodBank.address}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Home', {
                    foodBanks: foodBanks,
                    selectedFoodBank: selectedFoodBank,
                  });
                  setModalVisible(false);
                }}
                style={styles.infoButton}>
                <Text style={styles.infoButtonText}>Get Information</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const destination = `${selectedFoodBank.latitude},${selectedFoodBank.longitude}`;
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                  Linking.openURL(url);
                }}
                style={styles.directionsButton}>
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
            }}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 5,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#4c4947', // Example background color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10, // Example spacing
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  directionsButton: {
    backgroundColor: '#4986d7', // Example background color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10, // Example spacing
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
    backgroundColor: '#28a745', // Example background color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10, // Example spacing
  },
  infoButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MapScreen;
