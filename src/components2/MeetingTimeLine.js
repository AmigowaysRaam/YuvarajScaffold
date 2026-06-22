import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Linking, Pressable, StyleSheet, Text, View,
} from "react-native";
import MapView, { Marker, Polyline, } from "react-native-maps";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";

const MeetingTimeLine = () => {
  const navigation = useNavigation();
  // Static Test Coordinates (Madurai → Client)
  const currentLocation = {
    latitude: 9.9252,
    longitude: 78.1198,
  };

  const destination = {
    latitude: 9.9816,
    longitude: 78.0942,
  };

  const region = {
    latitude:
      (currentLocation.latitude +
        destination.latitude) /
      2,
    longitude:
      (currentLocation.longitude +
        destination.longitude) /
      2,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
  const startNavigation = () => {
    Linking.openURL(
      `google.navigation:q=${destination.latitude},${destination.longitude}`
    );
  };
  return (
    <View style={styles.wrapper}>
      <CommonHeader
        showBackButton
        title="Meeting Route"
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <Pressable
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: "#2563EB",
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
          }}
          onPress={startNavigation}
        >
          <Text
            style={{
              color: "#FFF",
              fontWeight: "bold",
            }}
          >
            Start Navigation
          </Text>
        </Pressable>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            Meeting Route
          </Text>
          <Text style={styles.headerSubTitle}>
            Static Testing Coordinates
          </Text>
        </View>
        <View style={{ height: hp(50) }}>
          <MapView
            style={styles.map}
            initialRegion={region}
            loadingEnabled={false}
            showsCompass
            rotateEnabled
            zoomEnabled
            scrollEnabled
          >
            <Marker
              coordinate={currentLocation}
              title="Current Location"
              description="Employee Location"
              pinColor="green"
            />
            <Marker
              coordinate={destination}
              title="Meeting Location"
              description="Client Location"
              pinColor="red"
            />
            <Polyline
              coordinates={[
                currentLocation,
                destination,
              ]}
              strokeWidth={5}
              strokeColor="#2563EB"
            />
          </MapView>

        </View>

      </View>
    </View>
  );
};
export default MeetingTimeLine;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
  },

  headerCard: {
    backgroundColor: "#2563EB",
    borderRadius: wp(5),
    padding: wp(5),
    marginBottom: hp(2),
  },

  headerTitle: {
    color: "#FFF",
    fontSize: wp(5),
    fontWeight: "700",
  },

  headerSubTitle: {
    color: "#DCE7FF",
    fontSize: wp(3.2),
    marginTop: hp(0.5),
  },

  map: {
    flex: 1,
    borderRadius: wp(4),
    overflow: "hidden",
  },
});