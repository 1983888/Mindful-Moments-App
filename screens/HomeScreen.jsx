import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Switch,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = ({route}) => {
  const navigation = useNavigation();
  const {foodBanks, selectedFoodBank} = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [filteredFoodBanks, setFilteredFoodBanks] = useState([]);
  const [foodBankNeeds, setFoodBankNeeds] = useState([]);
  const [favoritedFoodBanks, setFavoritedFoodBanks] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);



  useEffect(() => {
    // Load favorited food banks from AsyncStorage
    const loadFavorited = async () => {
      await loadFavoritedFoodBanks();
    };

    loadFavorited();
  }, []);

  useEffect(() => {
    getFoodBanks(searchText);
    if (selectedFoodBank) {
      fetchNeedsData(selectedFoodBank);
    }
  }, [
    searchText,
    selectedFoodBank,
    favoritedFoodBanks,
    selectedLocation,
    selectedNetwork,
  ]);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setUserLocation({latitude, longitude});
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  const saveFavoritedFoodBanks = async favoritedList => {
    try {
      await AsyncStorage.setItem(
        'favoritedFoodBanks',
        JSON.stringify(favoritedList),
      );
    } catch (error) {
      console.error('Error saving favorited food banks:', error);
    }
  };

  const loadFavoritedFoodBanks = async () => {
    try {
      const favoritedList = await AsyncStorage.getItem('favoritedFoodBanks');
      if (favoritedList) {
        setFavoritedFoodBanks(JSON.parse(favoritedList));
      }
    } catch (error) {
      console.error('Error loading favorited food banks:', error);
    }
  };
  const getFoodBanks = async () => {
    try {
      const response = await fetch(
          'https://www.givefood.org.uk/api/2/foodbanks/',
      );
      let data = await response.json();

      data = data.filter(bank => bank.country === 'Scotland');

      if (searchText) {
        data = data.filter(foodBank =>
            foodBank.name.toLowerCase().includes(searchText.toLowerCase()),
        );
      }
      data = data.map(bank => {
        const [latitude, longitude] = bank.lat_lng.split(',');
        return {...bank, latitude, longitude};
      });

      if (selectedLocation === 'myLocation' && userLocation) {
        data = data
            .map(bank => ({
              ...bank,
              distance: getDistanceFromLatLonInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  parseFloat(bank.latitude),
                  parseFloat(bank.longitude),
              ),
            }))
            .sort((a, b) => a.distance - b.distance);
      } else if (selectedLocation) {
        data = data.filter(
            bank =>
                bank.latitude === selectedLocation.latitude &&
                bank.longitude === selectedLocation.longitude,
        );
      }

      if (selectedNetwork) {
        data = data.filter(bank => bank.network === selectedNetwork);
      }

      if (selectedLocation !== 'myLocation') {
        data.sort((a, b) => {
          const isAFavorited = favoritedFoodBanks.includes(a.name);
          const isBFavorited = favoritedFoodBanks.includes(b.name);

          if (isAFavorited && !isBFavorited) {
            return -1; // a comes first
          } else if (!isAFavorited && isBFavorited) {
            return 1; // b comes first
          } else {
            return 0; // maintain original order
          }
        });
      }


      setFilteredFoodBanks(data);
    } catch (error) {
      console.error('Error fetching food banks:', error);
    }
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const fetchShoppingListUrl = async foodBankName => {
    try {
      const response = await fetch(
        'https://www.givefood.org.uk/api/2/foodbanks/',
      );
      const data = await response.json();
      const foodBank = data.find(bank => bank.name === foodBankName);
      return foodBank ? foodBank.urls.shopping_list : null;
    } catch (error) {
      console.error('Error fetching shopping list URL:', error);
      return null;
    }
  };

  const fetchNeedsData = async foodBank => {
    try {
      const response = await fetch('https://www.givefood.org.uk/api/2/needs/');
      const data = await response.json();

      // Filter needs data for the selected food bank
      const filteredNeeds = data.filter(
        entry => entry.foodbank.name === foodBank.name,
      );

      // If there are no needs listed, fetch and display the shopping list URL
      if (filteredNeeds.length === 0) {
        const shoppingListUrl = await fetchShoppingListUrl(foodBank.name);
        if (shoppingListUrl) {
          setFoodBankNeeds([{shoppingListUrl}]);
        } else {
          setFoodBankNeeds([]);
        }
      } else {
        // Sort the filtered needs data by date (assuming date field is available)
        filteredNeeds.sort((a, b) => new Date(b.found) - new Date(a.found));

        // Get the most recently found entry
        const mostRecentEntry = filteredNeeds[0];

        // Set the most recently found entry to foodBankNeeds
        setFoodBankNeeds([mostRecentEntry]);
      }
    } catch (error) {
      console.error('Error fetching needs data:', error);
    }
  };

  const handleFoodBankPress = foodBank => {
    // Navigate to detailed information about the selected food bank
    navigation.navigate('Home', {foodBanks, selectedFoodBank: foodBank});
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => handleFoodBankPress(item)}
      style={styles.foodBankItem}>
      <Text style={styles.foodBankName}>{item.name}</Text>
      <Text style={styles.foodBankAddress}>{item.address}</Text>
      <TouchableOpacity onPress={() => toggleFavorite(item)}>
        <Text>{favoritedFoodBanks.includes(item.name) ? '⭐' : '☆'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  const handleShoppingListPress = shoppingListUrl => {
    Linking.openURL(shoppingListUrl)
      .then(() => {
        console.log('Shopping list URL opened successfully');
      })
      .catch(error => {
        console.error('Error opening shopping list URL:', error);
      });
  };

  const handlePhonePress = phone => {
    Linking.openURL(`tel:${phone}`)
      .then(() => {
        console.log('Phone call initiated successfully');
      })
      .catch(error => {
        console.error('Error initiating phone call:', error);
      });
  };

  const handleEmailPress = email => {
    Linking.openURL(`mailto:${email}`)
      .then(() => {
        console.log('Email client opened successfully');
      })
      .catch(error => {
        console.error('Error opening email client:', error);
      });
  };

  const handleHomepagePress = homepage => {
    Linking.openURL(homepage)
      .then(() => {
        console.log('Homepage opened successfully');
      })
      .catch(error => {
        console.error('Error opening homepage:', error);
      });
  };
  const toggleFavorite = foodBank => {
    setFavoritedFoodBanks(prev => {
      const isFavorited = prev.includes(foodBank.name);

      if (isFavorited) {
        // Remove the food bank from the favorites list
        return prev.filter(name => name !== foodBank.name);
      } else {
        // Add the food bank to the favorites list
        return [...prev, foodBank.name];
      }
    });
  };

  useEffect(() => {
    saveFavoritedFoodBanks(favoritedFoodBanks);
  }, [favoritedFoodBanks]);

  // If there's a selected food bank from the route, show its detailed information
  if (selectedFoodBank) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>Food Bank Information</Text>
        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>Name: {selectedFoodBank.name}</Text>
          <Text style={styles.detailText}>
            Address: {selectedFoodBank.address}
          </Text>
          <TouchableOpacity
            onPress={() => handlePhonePress(selectedFoodBank.phone)}>
            <Text>Phone:</Text>
            <Text style={styles.linkText}>{selectedFoodBank.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEmailPress(selectedFoodBank.email)}>
            <Text>Email:</Text>
            <Text style={styles.linkText}> {selectedFoodBank.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleHomepagePress(selectedFoodBank.urls.homepage)}>
            <Text>Homepage:</Text>
            <Text style={styles.linkText}>
              {selectedFoodBank.urls.homepage}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionHeader}>Needs</Text>
        <FlatList
          data={foodBankNeeds}
          renderItem={({item}) => (
            <View style={styles.needItem}>
              {item.needs ? (
                <Text>{item.needs}</Text> // Render needs if available
              ) : (
                <Text>
                  <Text>
                    No current needs listed.{'\n'}Visit the shopping list
                    instead.{'\n'}
                    {'\n'}
                  </Text>
                  <Text>Shopping List:{'\n'}</Text>
                  <Text
                    style={{color: 'blue', textDecorationLine: 'underline'}}
                    onPress={() =>
                      handleShoppingListPress(item.shoppingListUrl)
                    }>
                    {item.shoppingListUrl}
                  </Text>
                </Text>
              )}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text>No needs found</Text>}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Food Banks"
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* Location Filter */}
      <Picker
        selectedValue={selectedLocation}
        onValueChange={value => setSelectedLocation(value)}>
        <Picker.Item label="All Locations" value={null} />
        <Picker.Item label="Sort by My Location" value="myLocation" />
      </Picker>

      {/* Network Filter */}
      <Picker
        selectedValue={selectedNetwork}
        onValueChange={value => setSelectedNetwork(value)}>
        <Picker.Item label="All Networks" value={null} />
        <Picker.Item label="Trussell Trust" value="Trussell Trust" />
        <Picker.Item label="Independent" value="Independent" />
        <Picker.Item label="IFAN" value="IFAN" />
      </Picker>
      <FlatList
        data={filteredFoodBanks}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text>No results found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailContainer: {
    marginBottom: 20,
  },
  detailText: {
    marginBottom: 5,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
  searchInput: {
    padding: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  foodBankItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  foodBankName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodBankAddress: {
    fontSize: 14,
  },
  needItem: {
    marginVertical: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content horizontally
    marginBottom: 10,
  },
  toggleText: {
    fontSize: 16,
    marginRight: 10,
    color: '#000000',
  },
});

export default HomeScreen;
