import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";

const TodayMeetingsLIsts = () => {
  const navigation = useNavigation();

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fnGetMeetings = async () => {
    try {
      setLoading(true);

      const response = await fetchData(
        "my-meeting-list",
        "POST",
        {
          employeeId:
            // profileDetails?.id ||
            "6a2918dc2de30e591d60b805",
          pageNo: 1, per_page: 10, limit: 10,
        }
      );
      console.log(
        "Meeting API Response:",
        JSON.stringify(response, null, 2)
      );
      const meetingData =
        response?.proposals || [];
      if (
        response?.success
      ) {
        setMeetings(meetingData);
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.log(
        "Meeting API Error:",
        error
      );
      setMeetings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (profileDetails?.id) {
      fnGetMeetings();
    }
  }, [profileDetails?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fnGetMeetings();
  };

  const handleView = (item) => {
    console.log("Meeting Details:", item);
    navigation.navigate("MeetingDetailsScreen", {
      meetingData: item,
    });
  };
  const handleViewAll = () => {
    navigation.navigate("MeetingListScreen", {
      meetings,
      title: "Today's Meetings",
    });
  };

  const renderMeeting = ({ item, index }) => {
    const clientName =
      item?.leadId?.name || "Client Meeting";

    const location =
      item?.leadId?.address ||
      item?.leadId?.district ||
      "Location Not Available";

    const description = `Lead ID : ${item?.leadId?.leadId || "-"
      }`;

    const distance =
      item?.location?.distanceKm
        ? `${item.location.distanceKm} KM`
        : "--";

    const travelTime =
      item?.location?.drivingDurationMin
        ? `${item.location.drivingDurationMin} Min`
        : "--";

    return (
      <Pressable
        onPress={
          () => navigation?.navigate('MeetingTimeLine')
        }
        style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {clientName?.charAt(0)?.toUpperCase()}
            </Text>
          </View>

          <View style={styles.clientInfo}>
            <Text
              numberOfLines={1}
              style={styles.clientName}
            >
              {clientName}
            </Text>

            <View style={styles.locationRow}>
              <Icon
                name="map-marker"
                size={15}
                color="#EF4444"
              />

              <Text
                numberOfLines={1}
                style={styles.location}
              >
                {location}
              </Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              #{index + 1}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={styles.description}
        >
          {description}
        </Text>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.metricCard}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    "#DBEAFE",
                },
              ]}
            >
              <Icon
                name="map-marker-distance"
                size={18}
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.metricLabel}>
                Distance
              </Text>

              <Text style={styles.metricValue}>
                {distance}
              </Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    "#D1FAE5",
                },
              ]}
            >
              <Icon
                name="clock-outline"
                size={18}
                color="#10B981"
              />
            </View>

            <View>
              <Text style={styles.metricLabel}>
                Travel Time
              </Text>

              <Text style={styles.metricValue}>
                {travelTime}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => handleView(item)}
          style={styles.viewButton}
        >
          <Icon
            name="eye-outline"
            size={18}
            color="#FFF"
          />

          <Text style={styles.viewText}>
            View Details
          </Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        showBackButton
        onBackPress={() => navigation.goBack()}
        title="Today's Meetings"
      />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={meetings}
              keyExtractor={(item, index) =>
                item?._id || index.toString()
              }
              renderItem={renderMeeting}
              refreshing={refreshing}
              onRefresh={onRefresh}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Icon
                    name="calendar-remove"
                    size={60}
                    color="#CBD5E1"
                  />
                  <Text style={styles.emptyText}>
                    No Meetings Available
                  </Text>
                </View>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default TodayMeetingsLIsts;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4), paddingTop: hp(1),
  }, headerCard: {
    backgroundColor: "#2563EB", borderRadius: wp(5), padding: wp(5),
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2),
  },
  headerTitle: { color: "#FFF", fontSize: wp(5), fontWeight: "700", },
  headerSubTitle: { color: "#DCE7FF", fontSize: wp(3.2), marginTop: hp(0.4), }, countBadge: {
    width: wp(14),
    height: wp(14), borderRadius: wp(7), backgroundColor: "#FFF", justifyContent: "center",
    alignItems: "center",
  }, countText: { color: "#2563EB", fontSize: wp(5), fontWeight: "700", },
  card: {
    backgroundColor: "#FFF", borderRadius: wp(4), padding: wp(2),
    marginBottom: hp(1.5), shadowColor: "#000", shadowOpacity: 0.08,
    shadowRadius: 8, shadowOffset: {
      width: 0, height: 3,
    }, elevation: 5,
  }, cardHeader: { flexDirection: "row", alignItems: "center", },
  avatarContainer: {
    width: wp(8), height: wp(8), borderRadius: wp(6),
    backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center",
  },
  avatarText: {
    color: "#FFF", fontSize: wp(4), fontWeight: "700",
  }, clientInfo: { flex: 1, marginLeft: wp(3), }, clientName: {
    color: "#111827",
    fontSize: wp(3), fontWeight: "700",
  }, locationRow: {
    flexDirection: "row",
    alignItems: "center", marginTop: hp(0.4),
  }, location: {
    color: "#6B7280", marginLeft: 4, flex: 1, fontSize: wp(2),
  }, statusBadge: {
    backgroundColor: "#E0E7FF", paddingHorizontal: wp(3), paddingVertical: hp(0.5),
    borderRadius: wp(5),
  }, statusText: { color: "#2563EB", fontSize: wp(2.8), fontWeight: "700", },
  description: {
    marginTop: hp(1.3),
    color: "#4B5563", fontSize: wp(3.2), lineHeight: 20,
  }, divider: {
    height: 1, backgroundColor: "#F1F5F9", marginVertical: hp(1.5),
  }, bottomRow: {
    flexDirection: "row", justifyContent: "space-between",
  }, metricCard: {
    flexDirection: "row", alignItems: "center",
  }, iconCircle: {
    width: wp(10),
    height: wp(10), borderRadius: wp(5), justifyContent: "center", alignItems: "center",
    marginRight: wp(2),
  },
  metricLabel: { color: "#6B7280", fontSize: wp(2.8), }, metricValue: {
    color: "#111827", fontWeight: "700", fontSize: wp(3.3),
  },
  viewButton: {
    marginTop: hp(2), backgroundColor: "#2563EB", borderRadius: wp(3),
    paddingVertical: hp(1.2),
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  viewText: {
    color: "#FFF", fontSize: wp(3.3), fontWeight: "700",
    marginLeft: wp(1.5),
  }, viewAllButton: {
    backgroundColor: "#2563EB",
    marginTop: hp(1),
    marginBottom: hp(2), borderRadius: wp(3), paddingVertical: hp(1.4),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  viewAllText: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontWeight: "700",
    marginRight: wp(2),
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(10),
  },

  emptyText: {
    marginTop: hp(1),
    color: "#64748B",
    fontSize: wp(3.8),
    fontWeight: "600",
  },
});