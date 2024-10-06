Note: <br>
To actually use the location service we need to go into the following path
```
node_modules/react-native-geolocation-service/android/build.gradle
```

and change the following line
```
def DEFAULT_GOOGLE_PLAY_SERVICES_VERSION = "*.*.*"
```

to
```
def DEFAULT_GOOGLE_PLAY_SERVICES_VERSION = "21.0.1"
```

Also, to use the packages on IOS, we need to update Info.plist and run pod install
