import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
export default function AttendanceActivity() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [summary] = useState({
    totalEmployees: 120, online: 98, break: 12, offline: 10,
  });
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    loadEmployees();
  
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
  
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
  
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 700,
          useNativeDriver: true,
        }),
  
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadEmployees = () => {
    setEmployees([
      {
        id: 1,
        name: "John Doe",
        employeeId: "EMP001",
        loginTime: "09:02 AM",
        activity: "Preparing Sales Report",
        status: "Online",
      },
      {
        id: 2,
        name: "Sarah Wilson",
        employeeId: "EMP002",
        loginTime: "09:15 AM",
        activity: "Lunch Break",
        status: "On Break",
      },
      {
        id: 3,
        name: "David Kumar",
        employeeId: "EMP003",
        loginTime: "-",
        activity: "Last seen 05:45 PM",
        status: "Offline",
      },
      {
        id: 4,
        name: "Jennifer Lee",
        employeeId: "EMP004",
        loginTime: "08:55 AM",
        activity: "Client Meeting",
        status: "Online",
      },
    ]);

    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEmployees();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Online":
        return "#4CAF50";
      case "On Break":
        return "#FF9800";
      case "Offline":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const SummaryCard = ({ title, value, color }) => (
    <Animated.View
      style={[
        styles.summaryCard,
        {
          borderLeftColor: color,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>
          {title}
        </Text>
  
        <Text style={styles.summaryValue}>
          {value}
        </Text>
      </View>
    </Animated.View>
  );
  const renderEmployee = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.employeeCard}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={24}
              color="#FFF"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.employeeName}>
              {item.name}
            </Text>

            <Text style={styles.employeeId}>
              {item.employeeId}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColor },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                { color: statusColor },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="log-in-outline"
            size={18}
            color="#4CAF50"
          />
          <Text style={styles.infoText}>
            Login Time: {item.loginTime}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="pulse-outline"
            size={18}
            color="#2196F3"
          />
          <Text style={styles.infoText}>
            {item.activity}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title={t("Employee Activity")}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEmployee}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              Employee Login Dashboard
            </Text>

            <View style={styles.summaryRow}>
              <SummaryCard
                title="Employees"
                value={summary.totalEmployees}
                icon="people-outline"
                color="#2196F3"
              />

              <SummaryCard
                title="Online"
                value={summary.online}
                icon="checkmark-circle-outline"
                color="#4CAF50"
              />
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard
                title="On Break"
                value={summary.break}
                icon="pause-circle-outline"
                color="#FF9800"
              />

              <SummaryCard
                title="Offline"
                value={summary.offline}
                icon="close-circle-outline"
                color="#F44336"
              />
            </View>

            <Text style={styles.listTitle}>
              Employee Activity
            </Text>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#F4F6FA",
  }, listContainer: { padding: wp(4), paddingBottom: hp(3), },
  heading: {
    fontSize: wp(5.2), fontWeight: "700", color: "#1A1A1A", marginBottom: hp(2),
  }, summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginBottom: hp(1.5),
  }, summaryCard: {
    width: "48%", backgroundColor: "#FFF", borderRadius: 16, padding: wp(4), borderLeftWidth: wp(1), elevation: 3,
  }, summaryHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  summaryValue: {
    fontSize: wp(5), fontWeight: "700", color: "#222",
  }, summaryTitle: { color: "#555", fontSize: wp(3.2), fontFamily: "Poppins_600SemiBold", },

  listTitle: { fontSize: wp(4.5), fontWeight: "700", color: "#222", marginTop: hp(1), marginBottom: hp(2), }, employeeCard: {
    backgroundColor: "#FFF", borderRadius: 18,
    padding: wp(4), marginBottom: hp(1.5), elevation: 2,
  }, topRow: {
    flexDirection: "row", alignItems: "center",
  }, avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center", marginRight: wp(3),
  }, employeeName: {
    fontSize: wp(4), fontWeight: "700", color: "#222",
  }, employeeId: { fontSize: wp(3), color: "#888", marginTop: 2, },
  statusContainer: { flexDirection: "row", alignItems: "center" }, statusDot: {
    width: 10, height: 10, borderRadius: 5, marginRight: wp(1.5),
  },
  statusText: { fontSize: wp(3.2), fontWeight: "600", }, infoRow: { flexDirection: "row", alignItems: "center", marginTop: hp(1.2), },
  infoText: {
    marginLeft: wp(2), fontSize: wp(3.3), color: "#555",
  },
});