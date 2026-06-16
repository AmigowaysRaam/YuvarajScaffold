
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import ApplyLeaveModal from "./ApplyLeaveModal";
import CommonHeader from "./CommonHeader";

const statuses = ["All", "Pending", "Approved", "Rejected"];

const initialLeaves = [
  {
    id: 1,
    leaveType: "Casual Leave",
    fromDate: "12 Jun 2026",
    toDate: "14 Jun 2026",
    days: 3,
    status: "Approved",
    reason: "Family Function",
  },
  {
    id: 2,
    leaveType: "Sick Leave",
    fromDate: "20 Jun 2026",
    toDate: "21 Jun 2026",
    days: 2,
    status: "Pending",
    reason: "Fever",
  },
  {
    id: 3,
    leaveType: "Permission",
    fromDate: "25 Jun 2026",
    toDate: "25 Jun 2026",
    days: 1,
    status: "Rejected",
    reason: "Personal Work",
  },
];

const LeaveManagement = () => {
  const navigation = useNavigation();
  const formatDate = (date) => {
    return new Date(date).toDateString(); // or your custom format
  };
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [leaves, setLeaves] = useState(initialLeaves);

  // modal state moved out (still controlled here)
  const [modalVisible, setModalVisible] = useState(false);

  // form state
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#16A34A";
      case "Rejected":
        return "#DC2626";
      case "Pending":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const matchStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      const matchSearch =
        item.leaveType.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [selectedStatus, search, leaves]);

  const statusCounts = useMemo(() => {
    const counts = {
      All: leaves.length,
      Pending: 0,
      Approved: 0,
      Rejected: 0,
    };

    leaves.forEach((item) => {
      counts[item.status] += 1;
    });

    return counts;
  }, [leaves]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const applyLeave = () => {
    if (!leaveType?.trim()) return;
    if (!fromDate) return;
    if (!toDate) return;
  
    const newLeave = {
      id: Date.now(),
      leaveType: leaveType.trim(),
      fromDate: String(fromDate),
      toDate: String(toDate),
      days: 1,
      status: "Pending",
      reason,
    };
  
    setLeaves((prev) => [newLeave, ...prev]);
  
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setReason("");
    setModalVisible(false);
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.leaveType}>{item.leaveType}</Text>

        <Text style={styles.dateText}>
          📅 {item.fromDate} - {item.toDate}
        </Text>

        <Text style={styles.daysText}>🗓️ {item.days} Day(s)</Text>

        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + "20" },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.status) },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Leave Management"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <TextInput
        placeholder="Search Leave..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      <View style={styles.tabs}>
        {statuses.map((status) => (
          <Pressable
            key={status}
            onPress={() => setSelectedStatus(status)}
            style={[
              styles.tab,
              selectedStatus === status && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === status && styles.activeTabText,
              ]}
            >
              {status} ({statusCounts[status]})
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredLeaves}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: wp(4),
          paddingBottom: hp(12),
        }}
        ItemSeparatorComponent={() => <View style={{ height: hp(1) }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Leave Requests Found</Text>
        }
      />

      <Pressable
        style={styles.applyButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.applyButtonText}>+ Apply Leave</Text>
      </Pressable>

      <ApplyLeaveModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={applyLeave}
        leaveType={leaveType}
        setLeaveType={setLeaveType}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        reason={reason}
        setReason={setReason}
        formatDate={formatDate}
      />
    </View>
  );
};

export default LeaveManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  searchBar: {
    margin: wp(4),
    backgroundColor: "#FFF",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    elevation: 2,
    fontSize: wp(3.5),
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp(4),
    marginBottom: hp(1),
  },

  tab: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    marginRight: wp(2),
    marginBottom: wp(2),
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: wp(3),
    color: "#374151",
  },

  activeTabText: {
    color: "#FFF",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: wp(3),
    padding: wp(4),
    elevation: 2,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  leaveType: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#111827",
  },

  dateText: {
    marginTop: hp(0.6),
    color: "#4B5563",
    fontSize: wp(3.2),
  },

  daysText: {
    marginTop: hp(0.4),
    color: "#6B7280",
    fontSize: wp(3),
  },

  reasonText: {
    marginTop: hp(0.8),
    color: "#374151",
    fontSize: wp(3.1),
  },

  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
    marginLeft: wp(2),
  },

  statusText: {
    fontWeight: "700",
    fontSize: wp(3),
  },

  applyButton: {
    position: "absolute",
    bottom: hp(3),
    right: wp(5),
    backgroundColor: COLORS.primary,
    borderRadius: wp(10),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    elevation: 5,
  },

  applyButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: wp(3.5),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: wp(5),
  },

  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: wp(4),
    padding: wp(5),
  },

  modalTitle: {
    fontSize: wp(5),
    fontWeight: "700",
    marginBottom: hp(2),
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(1.5),
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: hp(1),
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#9CA3AF",
    padding: wp(3),
    borderRadius: wp(2),
    marginRight: wp(2),
    alignItems: "center",
  },

  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: wp(3),
    borderRadius: wp(2),
    alignItems: "center",
  },

  modalBtnText: {
    color: "#FFF",
    fontWeight: "700",
  },

  emptyText: {
    textAlign: "center",
    marginTop: hp(10),
    color: "#6B7280",
  },
});