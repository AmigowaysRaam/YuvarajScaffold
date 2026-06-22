import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Linking, Pressable, StyleSheet, Text, View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import AddEvidenceModal from "./AddEvidenceModal";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";
import ConfirmDropDown from "./ConfirmDropDown";
const GOOGLE_MAPS_API_KEY =
  "AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc";
const MeetingTimeLine = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const { mId } = route.params || {};
  const [selectedStatus, setSelectedStatus] =
    useState(null);
  const [showDropDonw, setshowDropDonw] =
    useState(false);
  const [getUpdate, setgetUpdate] =
    useState(false);

  const [loading, setlaoding] =
    useState(false);

  const [meetingData, setMeetingData] =
    useState(null);
  const [destination, setDestination] =
    useState(null);
  const [currentLocation, setCurrentLocation] =
    useState(null);
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  // data?.statusOptions setstatusList(data?.statusOptions)
  const [statusList, setstatusList] = useState([]);
  useEffect(() => {
    getMeetigDetails();
  }, []);
  const getMeetigDetails = async () => {
    try {
      setlaoding(true)
      const response = await fetchData(
        "meeting-lead-detail",
        "POST",
        {
          employeeId: profileDetails?.id,
          assignmentId: mId,
        }
      );
      if (response?.success) {
        const data = response?.data;
        setMeetingData(data);
        setCurrentLocation({
          latitude: Number(data?.visit?.startLat),
          longitude: Number(data?.visit?.startLon),
        });
        setDestination({
          latitude: Number(data?.location?.leadLat),
          longitude: Number(data?.location?.leadLng),
        });
        setstatusList(data?.statusOptions)

      }
    } catch (error) {
      console.log(
        "meeting-lead-detail API Error:",
        error
      );
    }
    finally {
      setlaoding(false)
    }
  };

  const region =
    currentLocation && destination
      ? {
        latitude:
          (currentLocation.latitude +
            destination.latitude) /
          2,
        longitude:
          (currentLocation.longitude +
            destination.longitude) /
          2,
        latitudeDelta: 1,
        longitudeDelta: 1,
      }
      : null;
  return (
    <View style={styles.wrapper}>
      <CommonHeader
        showBackButton
        title="Meeting Timeline"
        onBackPress={() => navigation.goBack()}
      />
      {
        loading ?
          <View style={{
            flex: 1, alignItems: "center", justifyContent: 'center',
            backgroundColor: COLORS?.primary + '22', margin: wp(5), borderRadius: wp(10)
          }}>
            <ActivityIndicator color={COLORS?.primary} />
          </View>
          :
          <>
            <View style={styles.container}>
              {/* Lead Details Card */}
              <View style={styles.infoCard}>
                {/* Top Row */}
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.leadName}>
                      {meetingData?.lead?.name || "Lead Information"}
                    </Text>
                    {!!meetingData?.lead?.contactNumber && (
                      <Pressable
                        onPress={() =>
                          Linking.openURL(
                            `tel:${meetingData?.lead?.contactNumber}`
                          )
                        }
                      >
                        <Text style={styles.phoneText}>
                          📞 {meetingData?.lead?.contactNumber}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.distanceContainer}>
                    <Text style={styles.smallValue}>
                      📌 {meetingData?.location?.distanceText || "-"}
                    </Text>

                    <Text style={styles.smallValue}>
                      ⏱️ {meetingData?.location?.durationText || "-"}
                    </Text>
                  </View>
                </View>
                {!!meetingData?.lead?.fullAddress && (
                  <Text style={styles.addressText}>
                    📍 {meetingData?.lead?.fullAddress}
                  </Text>
                )}

                <View style={styles.divider} />

                <View style={styles.row}>
                  <View style={styles.item}>
                    <Text style={styles.label}>
                      Journey Status
                    </Text>
                    <Text style={styles.value}>
                      {meetingData?.journeyStatus || "-"}
                    </Text>
                  </View>
                  <View style={styles.item}>
                    <Text style={styles.label}>
                      Started At
                    </Text>
                    <Text numberOfLines={1} style={styles.value}>
                      {meetingData?.visit?.startedAt || "-"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.mapContainer}>
                {currentLocation &&
                  destination &&
                  region && (
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
                        title="Start Location"
                        pinColor="green"
                      />

                      <Marker
                        coordinate={destination}
                        title={
                          meetingData?.lead?.name ||
                          "Destination"
                        }
                        description={
                          meetingData?.lead
                            ?.fullAddress
                        }
                        pinColor="red"
                      />

                      <MapViewDirections
                        origin={currentLocation}
                        destination={destination}
                        apikey={
                          GOOGLE_MAPS_API_KEY
                        }
                        strokeWidth={5}
                        strokeColor="#2563EB"
                        mode="DRIVING"
                        optimizeWaypoints
                        onReady={(result) => {
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
                        onError={(error) => {
                          console.log(
                            "Directions Error:",
                            error
                          );
                        }}
                      />
                    </MapView>
                  )}
              </View>
              <AddEvidenceModal
                statusList={statusList}
                visible={getUpdate}
                onClose={() =>
                  setgetUpdate(false)
                }
                onSubmit={(data) => {
                  console.log(
                    "Evidence Data =>",
                    data
                  );
                }}
              />
              <ConfirmDropDown
                title="Meeting Status"
                onClose={() =>
                  setshowDropDonw(false)
                }
                isVisible={showDropDonw}
                data={statusList}
                selectedItem={{
                  value: selectedStatus?.value,
                }}
                onSelect={(item) => {
                  setshowDropDonw(false);
                  setSelectedStatus(item);
                }}
              />

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={() => setgetUpdate(true)}
                  style={[styles.actionButton, { marginRight: wp(2) }]}
                >
                  <Text style={styles.updateButtonText}>
                    Attach
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setshowDropDonw(true)}
                  style={styles.actionButton}
                >
                  <Text style={styles.updateButtonText}>
                    {"Update Status"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
      }
    </View>
  );
};
export default MeetingTimeLine;
const styles = StyleSheet.create({
  wrapper: {
    flex: 1, backgroundColor: "#F8FAFC",
  }, topRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },

  buttonRow: { flexDirection: "row", marginTop: hp(2), }, actionButton: {
    flex: 1, backgroundColor: COLORS.primary,
    paddingVertical: hp(1.8), borderRadius: wp(3),
    alignItems: "center", justifyContent: "center",
  },
  distanceContainer: {
    alignItems: "flex-end",
    minWidth: wp(22),
  }, smallLabel: { fontSize: wp(3), color: "#6B7280", },
  smallValue: {
    fontSize: wp(3.5), color: "#111827", marginTop: wp(1), fontFamily: "Poppins_600SemiBold"
  },

  container: {
    flex: 1, paddingHorizontal: wp(4), paddingTop: hp(1),
  }, infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(4), padding: wp(4), marginBottom: hp(2), elevation: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  }, leadName: {
    fontSize: wp(5), fontWeight: "700", color: "#111827",
  }, phoneText: { marginTop: hp(0.8), fontSize: wp(3.8), color: COLORS.primary, fontWeight: "600", }, addressText: {
    marginTop: hp(0.8), fontSize: wp(3.4), color: "#6B7280", lineHeight: hp(2.3),
  }, divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: hp(1.5), },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: hp(1), }, item: { width: "48%", }, label: {
    fontSize: wp(3.2),
    color: "#6B7280", marginBottom: hp(0.4),
  }, value: {
    fontSize: wp(3.6), color: "#111827", fontWeight: "600",
  }, mapContainer: { overflow: "hidden", borderRadius: wp(4), }, map: { height: hp(45), width: "100%", }, updateButton: {
    backgroundColor: COLORS.primary, marginTop: hp(2), paddingVertical: hp(1.8),
    borderRadius: wp(3), alignItems: "center",
  }, updateButtonText: {
    color: "#FFF", fontWeight: "700", fontSize: wp(4),
  },
});