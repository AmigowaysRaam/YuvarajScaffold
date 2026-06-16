import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable, RefreshControl, ScrollView, StyleSheet, Text, View
} from "react-native";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
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

  const fetchHomepageData = async () => {
    if (!profileDetails?.id) return;
    try {
      if (!refreshing) setLoading(true);
      const response = await fetchData(
        "app-employee-homepage",
        "POST",
        {
          user_id: profileDetails.id,
          lang: lang || "en",
        }
      );
      if (
        response?.text === "Success" ||
        response?.text === "Fetched successfully"
      ) {
        // Alert.alert(JSON.stringify(response));
        // response [{"header_image": "https://hrms.yuvarajscaffoldingtraders.com/assets/images/home-banner/kas-silver-jubilee.png", "section": "header_image"}, {"employee_details": {"date": "11-06-2026", "designation": "", "employee_id": "Emp-045", "employee_status": "Active", "name": "Gowtham ", "time": "01:41 PM", "welcome_text": "Good Noon"}, "section": "employee_details"}, {"section": "my_tasks", "today_tasks": {"completed": "0", "count": "0", "in_progress": "0", "open": "0", "over_due": "0", "re_work": "0", "waiting_for_approval": "0"}, "total_tasks": {"completed": "0", "count": "0", "in_progress": "0", "open": "0", "over_due": "0", "re_work": "0", "waiting_for_approval": "0"}}, {"section": "assign_tasks", "today_tasks": {"completed": "0", "count": "0", "in_progress": "0", "open": "0", "over_due": "0", "re_work": "0", "waiting_for_approval": "0"}, "total_tasks": {"completed": "0", "count": "0", "in_progress": "0", "open": "0", "over_due": "0", "re_work": "0", "waiting_for_approval": "0"}}]

        console.log('response', JSON.stringify(response?.data))
        setHomepageData(response.data);
      } else {
        console.warn("HOMEAPI returned failure:", response);
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
            <LeadsRow homepageData={homepageData} />
            <PunchCard homepageData={homepageData} onLoading={setpunchLoading} />
            <AttendanceDetails homepageData={homepageData} />
            {/* <HomeMenuRow homepageData={homepageData} /> */}
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
});
