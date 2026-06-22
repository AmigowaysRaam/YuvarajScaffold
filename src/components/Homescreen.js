import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Device from 'expo-device';
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable, RefreshControl, ScrollView, StyleSheet, Text, View
} from "react-native";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import HomeSkeleton from "../../homeSkelton";
import { fetchData } from "./api/Api";
import AssignedTask from "./AssignedTask";
import AttendanceDetails from "./AttendanceDetails";
import Banner from "./Banner";
import Header from "./Header";
import InAppNotificationModal from "./InappNotification";
import LanguageMenu from "./LanguageMenu";
import LeadsRow from "./LeadsRow";
import MyTask from "./MyTask";
import PunchCard from "./PunchCard";
import SideMenu from "./Sidemenu";
import TaskRow from "./TaskRow";
import TodayMeetings from "./TodayMeetings";

export default function Homescreen() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [langMenuMOdal, setOpenLangMenu] = useState(false);
  const [punchLoading, setpunchLoading] = useState(false);
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lang, setLang] = useState(null);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifData, setNotifData] = useState(null);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const siteDetails = useSelector(
    (state) => state.auth?.siteDetails?.data[0]
  );
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  useEffect(() => {
    getStoredLanguage().then((storedLang) => {
      setLang(storedLang || "en");
    });
  }, []);
  const { showToast } = useToast();
  const fetchHomepageData = async () => {
    // console.log('profileDetails',JSON.stringify(profileDetails))
    if (!profileDetails?.id) return;
    const pseudoId = `${Device.brand}${Device.modelName}${profileDetails.id}`;
    try {
      if (!refreshing) setLoading(true);
      const response = await fetchData(
        "app-employee-homepage",
        "POST",
        {
          user_id: profileDetails.id,
          lang: lang || "en",
          deviceInfo: pseudoId
        }
      );
      if (
        response?.text === "Success" ||
        response?.text === "Fetched successfully"
      ) {
        console.log('Home API', JSON.stringify(response?.data, null, 2))
        setHomepageData(response.data);
      } else {
        if (response?.forceLogout) {
          await AsyncStorage.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: "MobileLogin" }],
          });
          showToast(response?.message, "info");
        }
      }
    } catch (error) {
      console.error("HOME API Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchHomepageData();
    // Alert.alert("Welcome!",JSON.stringify(profileDetails));
  }, [profileDetails?.id, lang, punchLoading]);
  useFocusEffect(
    useCallback(() => {
      fetchHomepageData();
    }, [profileDetails?.id, lang])
  );

  /* 🔔 RELOAD API WHEN NOTIFICATION ARRIVES */
  // useEffect(() => {
  //   // Foreground notification
  //   const unsubscribeOnMessage = messaging().onMessage(async (notification) => {
  //     console.log("🔔 Foreground notification received");
  //     setNotifData({
  //       title: notification?.notification?.title,
  //       body: notification?.notification?.body,
  //       data: notification?.data,
  //     });
  //     setNotifModalVisible(true);
  //   });
  //   return () => {
  //     unsubscribeOnMessage();
  //   };
  // }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomepageData();
  };

  return (
    <View style={[styles.container, {
    }]}>
      <Header
        openMenu={() => setIsMenuOpen(!isMenuOpen)}
        headerL={siteDetails?.["header-logo"]}
        openLanguageMenu={() => setOpenLangMenu(true)}
        notificationCount={homepageData?.notification_count}
      />
      {
        __DEV__ &&
        <Pressable onPress={() => navigation.navigate('AttendanceLoginScreen')} style={{
          padding: wp(4), borderColor: COLORS?.primary, width: wp(95), alignSelf: "center",
          borderRadius: wp(10), borderWidth: wp(2), backgroundColor: COLORS?.primary + '40', marginVertical: wp(0.5),
          alignSelf: "center", alignItems: "center",
        }}>
          <Text style={{
            color: COLORS?.primary,
            fontFamily: "Poppins_500Medium",
          }}>
            Mark Attendance
          </Text>
        </Pressable>
      }
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor="#f2f2f2"
          />
        }
      >
        {loading ? (
          <HomeSkeleton />
        ) : homepageData ? (
          <>
            <Banner homepageData={homepageData} />
            <TodayMeetings homepageData={homepageData} />
            <LeadsRow homepageData={homepageData} />
            <PunchCard homepageData={homepageData} onLoading={setpunchLoading} />
            <AttendanceDetails homepageData={homepageData} />
            <TaskRow homepageData={homepageData} />
            <MyTask homepageData={homepageData} />
            <AssignedTask homepageData={homepageData} />
          </>
        ) : (
          <View style={styles.loaderContainer}>
            <Text>{t('no_data')}</Text>
          </View>
        )}
      </ScrollView>
      {
        __DEV__ && (
          <Pressable
            // onPress={() => navigation.navigate("AttendanceLoginScreen")}
            style={styles.ongoingCard}
          >
            <View style={styles.statusDot} />
            <View style={styles.ongoingContent}>
              <View style={styles.ongoingHeader}>
                <Text style={styles.ongoingTitle}>
                  On Going
                </Text>

                <Text style={styles.timeText}>
                  Live
                </Text>
              </View>

              <Text style={styles.clientName}>
                ABC Industries
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location"
                  size={14}
                  color="#10B981"
                />

                <Text style={styles.ongoingSubText}>
                  Anna Nagar, Madurai
                </Text>
              </View>

              <Text style={styles.meetingText}>
                Product Demo & Requirement Discussion
              </Text>

            </View>
          </Pressable>
        )
      }
      <SideMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <LanguageMenu
        visible={langMenuMOdal}
        onClose={() => setOpenLangMenu(false)}
        loadData={(newLang) => {
          setLang(newLang);
          fetchHomepageData();
        }}
      />
      <InAppNotificationModal
        visible={notifModalVisible}
        title={notifData?.title}
        message={notifData?.body}
        onClose={() => setNotifModalVisible(false)}
        onPress={() => {
          console.log("Notification clicked:", notifData?.data);
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#fff",
  },
  scrollContainer: { flex: 1, alignSelf: "center", }, loaderContainer: {
    flex: 1,
    height: 300, justifyContent: "center", alignItems: "center",
  },
  ongoingCard: {
    width: wp(92),
    alignSelf: "center",
    flexDirection: "row",
    padding: wp(3.5),
    backgroundColor: "#ECFDF5",
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: "#10B981",
    marginVertical: hp(0.8),

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  statusDot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(2),
    backgroundColor: "#10B981",
    marginTop: hp(0.7),
    marginRight: wp(3),
  },

  ongoingContent: {
    flex: 1,
  },

  ongoingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ongoingTitle: {
    color: "#047857",
    fontSize: wp(3.8),
    fontWeight: "700",
  },

  timeText: {
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(3),
    fontSize: wp(2.8),
    fontWeight: "600",
  },

  clientName: {
    marginTop: hp(0.5),
    color: "#111827",
    fontSize: wp(3.6),
    fontWeight: "700",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.3),
  },

  ongoingSubText: {
    marginLeft: wp(1),
    color: "#6B7280",
    fontSize: wp(3),
  },

  meetingText: {
    marginTop: hp(0.5),
    color: "#4B5563",
    fontSize: wp(3),
  },
});
