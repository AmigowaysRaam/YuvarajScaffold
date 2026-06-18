import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";

const meetings = [
  {
    id: "1",
    clientName: "ABC Industries",
    location: "Anna Nagar, Madurai",
    description: "Product Demo & Requirement Discussion",
    distance: "3.2 km",
    travelTime: "12 mins",
  },
  {
    id: "2",
    clientName: "Tech Solutions Pvt Ltd",
    location: "KK Nagar, Madurai",
    description: "Follow-up Meeting",
    distance: "5.5 km",
    travelTime: "18 mins",
  },
  {
    id: "3",
    clientName: "Sun Enterprises",
    location: "Mattuthavani",
    description: "New Client Onboarding",
    distance: "8.1 km",
    travelTime: "25 mins",
  },
  {
    id: "4",
    clientName: "Green Agro",
    location: "Thirunagar",
    description: "Contract Discussion",
    distance: "10.4 km",
    travelTime: "30 mins",
  },
  {
    id: "5",
    clientName: "Global Traders",
    location: "Melur",
    description: "Quarterly Review Meeting",
    distance: "14.7 km",
    travelTime: "38 mins",
  },
];

const TodayMeetings = ({homepageData}) => {
  const navigation = useNavigation();
  const visibleMeetings = meetings.slice(0, 2);
  const todayMeetings = homepageData?.sections?.find(
    (item) => item.section === "meeting_list"
  );

  const handleView = (item) => {
    navigation.navigate("TodayMeetingsLIsts", {
      meetingData: item,
    });
  };
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const fnGetMeetings = async () => {
    console.log(todayMeetings,"todayMeetings")
    try {
      const response = await fetchData(
        "my-meeting-list",
        "POST",
        {
          employeeId: profileDetails?.id,
          per_page: 10, pageNo: 1,
          limit: 10,
        }
      );
      console.log(response, "list response")
      if (response?.success) {
      } else {
      }
    } catch (error) {
      console.log("my-meeting-list API Error:", error);
    } finally {
    }
  }
  useEffect(() => {
    fnGetMeetings()
    // my-meeting-list
  }, [])

  const handleViewAll = () => {
    navigation.navigate("TodayMeetingsLIsts", {
      meetings,
      title: "Today's Meetings",
    });
  };

  const renderMeeting = ({ item, index }) => (
    <View style={styles.card}>

      <View style={styles.topRow}>
        <View style={styles.clientSection}>
          <Text numberOfLines={1} style={styles.clientName}>
            {item.clientName}
          </Text>

          <View style={styles.locationRow}>
            <Icon
              name="map-marker"
              size={16}
              color="#EF4444"
            />

            <Text numberOfLines={1} style={styles.location}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.serialBadge}>
          <Text style={styles.serialText}>
            #{index + 1}
          </Text>
        </View>
      </View>


      <Text
        numberOfLines={2}
        style={styles.description}
      >
        {item.description}
      </Text>


      <View style={styles.infoContainer}>

        <View style={styles.infoBox}>
          <Icon
            name="map-marker-distance"
            size={17}
            color="#2563EB"
          />
          <Text style={styles.infoValue}>
            {item.distance}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Icon
            name="clock-outline"
            size={17}
            color="#10B981"
          />
          <Text style={styles.infoValue}>
            {item.travelTime}
          </Text>
        </View>
        <Pressable
          // onPress={() => handleView(item)}
          style={styles.viewButton}
        >
          <Text style={styles.viewText}>
            View
          </Text>
        </Pressable>

      </View>

    </View>
  );


  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerCard}>

        <View>
          <Text style={styles.headerTitle}>
            Today's Meetings
          </Text>

          <Text style={styles.headerSubTitle}>
            Total Meetings Scheduled
          </Text>
        </View>


        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {meetings.length}
          </Text>
        </View>

      </View>


      {/* Meetings List */}
      <View style={styles.listContainer}>

        <FlatList
          data={visibleMeetings}
          keyExtractor={(item) => item.id}
          renderItem={renderMeeting}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />

      </View>


      {/* View All Button Below List */}
      <Pressable
        onPress={handleViewAll}
        style={styles.viewAllButton}
      >
        <Text style={styles.viewAllText}>
          View All Meetings
        </Text>
      </Pressable>


    </View>
  );
};
export default TodayMeetings;

const styles = StyleSheet.create({

  container: {
    width: wp(92),
    alignSelf: "center",
    marginTop: hp(1),
    backgroundColor: COLORS?.primary + "50",
    borderRadius: wp(3),
    padding: wp(3),
  },


  headerCard: {
    backgroundColor: "#2563EB",
    borderRadius: wp(4),
    padding: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
  },


  headerTitle: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "700",
  },


  headerSubTitle: {
    color: "#DCE7FF",
    fontSize: wp(3),
    marginTop: hp(0.3),
  },


  countBadge: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(6),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },


  countText: {
    color: "#2563EB",
    fontSize: wp(4.8),
    fontWeight: "700",
  },


  listContainer: {
    minHeight: hp(22),
  },


  card: {
    backgroundColor: "#FFF",
    borderRadius: wp(3),
    padding: wp(3.5),
    marginBottom: hp(1.2),

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },


  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },


  clientSection: {
    flex: 1,
    marginRight: wp(2),
  },


  clientName: {
    fontSize: wp(3.8),
    fontWeight: "700",
    color: "#111827",
  },


  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.3),
  },


  location: {
    marginLeft: 4,
    color: "#6B7280",
    fontSize: wp(3),
    flex: 1,
  },


  serialBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(5),
  },


  serialText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: wp(3),
  },


  description: {
    marginTop: hp(1),
    color: "#4B5563",
    fontSize: wp(3),
    lineHeight: 18,
  },


  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1.4),
  },


  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
  },


  infoValue: {
    marginLeft: 4,
    color: "#111827",
    fontSize: wp(3),
    fontWeight: "600",
  },


  viewButton: {
    marginLeft: "auto",
    backgroundColor: "#2563EB",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: wp(2),
  },


  viewText: {
    color: "#FFF",
    fontSize: wp(3),
    fontWeight: "600",
  },


  viewAllButton: {
    backgroundColor: "#2563EB",
    marginTop: hp(0.5),
    paddingVertical: hp(1.2),
    borderRadius: wp(3),
    alignItems: "center",
  },


  viewAllText: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontWeight: "700",
  },

});