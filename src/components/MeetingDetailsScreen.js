import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
  Linking, StyleSheet, Text, View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useSelector } from "react-redux";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
import { fetchData } from "./api/Api";

const GOOGLE_MAPS_API_KEY = "AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc";

const MeetingDetailsScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const currentLocation = {
    latitude: 9.9252,
    longitude: 78.1198,
  };
  const destination = {
    latitude: 9.9816,
    longitude: 78.0942,
  };
  const { mId } = useRoute().params || {};
  useEffect(() => {
    getMeetigDetails()
  }, [])
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const getMeetigDetails = async () => {
    try {
      const response = await fetchData(
        "meeting-lead-detail ",
        "POST",
        {
          employeeId: profileDetails?.id,
          // "employeeId": "6a2a6d481a97a14713b20567",
          "assignmentId": "6a33cf5ce72b58c52fc9bfad",
        }
      );
      console.log(response, "meeting-lead-detail response")
      if (response?.success) {

      } else {
      }
    } catch (error) {
      console.error("meeting-lead-detail API Error:", error);
    } finally {

    }
  }

  const region = {
    latitude:
      (currentLocation.latitude +
        destination.latitude) /
      2,
    longitude:
      (currentLocation.longitude +
        destination.longitude) /
      2,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const startNavigation = () => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
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
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {JSON.stringify(mId)}
          </Text>
        </View>

        <View style={{
          height: hp(45)
        }}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            showsCompass
            zoomEnabled
            scrollEnabled
          >
            <Marker
              coordinate={currentLocation}
              title="My Location"
              pinColor="green"
            />

            <Marker
              coordinate={destination}
              title="Meeting Location"
              pinColor="red"
            />

            <MapViewDirections
              origin={currentLocation}
              destination={destination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={6}
              strokeColor="#2563EB"
              mode="DRIVING"
              optimizeWaypoints
              onReady={(result) => {
                console.log(
                  "Distance:",
                  result.distance,
                  "KM"
                );

                console.log(
                  "Duration:",
                  result.duration,
                  "Minutes"
                );

                mapRef.current?.fitToCoordinates(
                  result.coordinates,
                  {
                    edgePadding: {
                      top: 80,
                      right: 40,
                      bottom: 80,
                      left: 40,
                    },
                    animated: true,
                  }
                );
              }}
              onError={(errorMessage) => {
                console.log(
                  "Directions Error:",
                  errorMessage
                );
              }}
            />
          </MapView>
        </View>

      </View>
    </View>
  );
};
export default MeetingDetailsScreen;

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
  },

  navigationButton: {
    backgroundColor: "#2563EB",
    paddingVertical: hp(1.8),
    borderRadius: wp(3),
    marginVertical: hp(2),
    alignItems: "center",
  },

  navigationText: {
    color: "#FFF",
    fontSize: wp(4),
    fontWeight: "700",
  },
});