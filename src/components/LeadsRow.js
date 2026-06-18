import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Pressable, StyleSheet, Text, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { hp, wp } from "../../app/resources/dimensions";
const leadData = [
  {
    key: "today",
    title: "Today's Leads",
    count: 25,
    icon: "calendar-check",
    color: "#10B981",
    subtitle: "Overview of today",
    type: "today",
  },
  {
    key: "assigned",
    title: "Assigned",
    count: 120,
    icon: "clipboard-list-outline",
    color: "#2563EB",
  },
  {
    key: "queued",
    title: "Queued",
    count: 15,
    icon: "clock-outline",
    color: "#F59E0B",
  },
  {
    key: "pending",
    title: "Pending",
    count: 35,
    icon: "progress-clock",
    color: "#EF4444",
  },
  {
    key: "contacted",
    title: "Contacted",
    count: 80,
    icon: "phone-check-outline",
    color: "#06B6D4",
  },
  {
    key: "converted",
    title: "Converted",
    count: 40,
    icon: "check-circle-outline",
    color: "#22C55E",
  },
  {
    key: "rejected",
    title: "Rejected",
    count: 10,
    icon: "close-circle-outline",
    color: "#DC2626",
  },
];
const LeadsRow = () => {
  const navigation = useNavigation();

  const handlePress = (item) => {
    navigation.navigate("LeadListScreen", {
      status: item.key,
      title: item.title,
    });
  };

  const today = leadData.find((i) => i.key === "today");
  const gridItems = leadData.filter((i) => i.key !== "today");

  return (
    <View style={styles.container}>
      {today && (
        <Pressable
          onPress={() => handlePress(today)}
          style={[
            styles.todayCard,
            { borderLeftColor: today.color },
          ]}
        >
          <View style={styles.todayLeft}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${today.color}15` },
              ]}
            >
              <Icon
                name={today.icon}
                size={wp(6)}
                color={today.color}
              />
            </View>
            <View>
              <Text style={styles.todayTitle}>
                {today.title}
              </Text>
              <Text style={styles.subtitle}>
                {today.subtitle}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.todayCount,
              { color: today.color },
            ]}
          >
            {today.count}
          </Text>
        </Pressable>
      )}
      <View style={styles.grid}>
        {gridItems.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => handlePress(item)}
            style={styles.card}
          >
            <View
              style={[
                styles.iconBoxSmall,
                { backgroundColor: `${item.color}15` },
              ]}
            >
              <Icon
                name={item.icon}
                size={wp(4.3)}
                color={item.color}
              />
            </View>

            <Text
              style={[
                styles.count,
                { color: item.color },
              ]}
            >
              {item.count}
            </Text>

            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
export default LeadsRow;
const styles = StyleSheet.create({
  container: {
    width: wp(90), alignSelf: "center", marginTop: hp(1),
  },
  todayCard: {
    width: "100%", height: hp(8.5), backgroundColor: "#fff",
    borderRadius: wp(3.5), borderLeftWidth: 5, paddingHorizontal: wp(4), flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: hp(1.5), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  }, todayLeft: {
    flexDirection: "row", alignItems: "center", flex: 1,
  }, todayTitle: {
    fontSize: wp(3.9), fontFamily: "Poppins_600SemiBold",
    color: "#111827",
  }, subtitle: {
    fontSize: wp(2.8), color: "#9CA3AF", fontFamily: "Poppins_400Regular",
    marginTop: 2,
  }, todayCount: { fontSize: wp(7), fontFamily: "Poppins_800ExtraBold", }, grid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "space-between",
  }, card: {
    width: "31%", backgroundColor: "#fff",
    borderRadius: wp(3), paddingVertical: hp(1.2), paddingHorizontal: wp(2), marginBottom: hp(1.2),
    alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  }, iconBoxSmall: {
    width: wp(8), height: wp(8),
    borderRadius: wp(4), justifyContent: "center", alignItems: "center", marginBottom: 4,
  }, count: { fontSize: wp(4.5), fontFamily: "Poppins_700Bold", }, title: {
    fontSize: wp(2.8), color: "#6B7280", fontFamily: "Poppins_500Medium", textAlign: "center",
  },
});