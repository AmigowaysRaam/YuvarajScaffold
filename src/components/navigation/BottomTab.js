import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import {
  Animated, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../../app/resources/colors";
import { hp, wp } from "../../../app/resources/dimensions";
import AssignTaskListScreen from "../AssignTaskListScreen";
import AttendanceActivity from "../AttendanceActivity";
import AttendanceLoginScreen from "../AtttendanceLogin";
import Homescreen from "../Homescreen";
import MyTaskListScreen from "../MyTaskListScreen";
import Profilescreen from "../Profilescreen";

const Tab = createBottomTabNavigator();

const MENU_RESPONSE = {
  menus: [
    {
      key: "home", label: "Home",
    },
    {
      key: "mytask", label: "My Task",
    },
    {
      key: "assignedTask", label: "Assign Task",
    },
    {
      key: "myAccount", label: "My Account",
    },
    {
      key: "activity", label: "Activity",
    },
    {
      key: "faceLogin", label: "Face Login",
    },
  ],
};

const MENU_CONFIG = {
  home: {
    component: Homescreen,
    icon: require("../../../assets/homeTab.png"),
  },
  faceLogin: {
    component: AttendanceLoginScreen,
    icon: require("../../../assets/MyTaskside.png"),
  },
  mytask: {
    component: MyTaskListScreen,
    icon: require("../../../assets/myTask.png"),
  },
  assignedTask: {
    component: AssignTaskListScreen,
    icon: require("../../../assets/assignTask.png"),
  },
  myAccount: {
    component: Profilescreen,
    icon: require("../../../assets/myAcc.png"),
  },
  activity: {
    component: AttendanceActivity,
    icon: require("../../../assets/assignTaskFill.png"),
  },
};

function CustomTabBar({ state, navigation, menus }) {
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const tabWidth = wp(100) / menus.length;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      stiffness: 120,
      damping: 15,
      mass: 1,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <ImageBackground style={styles.tabBar} resizeMode="cover">
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const menu = menus.find(
          (item) => item.label === route.name
        );

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={[
              styles.tabItem,
              {
                backgroundColor: isFocused ? "#FFF" : "transparent",
                borderRadius: isFocused ? wp(10) : 0,
                paddingVertical: hp(0.5),
              },
            ]}
          >
            <Image
              source={menu?.icon}
              resizeMode="contain"
              style={[
                styles.icon,
                {
                  tintColor: isFocused
                    ? COLORS.primary
                    : "#FFF",
                },
              ]}
            />

            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: isFocused
                    ? COLORS.primary
                    : "#FFF",
                },
              ]}
            >
              {menu?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ImageBackground>
  );
}
export default function BottomTab() {
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const attendanceAccess =
    profileDetails?.attendanceAccess;

  const allowedKeys = attendanceAccess
    ? ["activity", "faceLogin"]
    : ["home", "mytask", "assignedTask", "myAccount"];

  const visibleMenus = Object.keys(MENU_CONFIG)
    .filter((key) => allowedKeys.includes(key))
    .map((key) => ({
      ...MENU_CONFIG[key],
      key,
      label:
        MENU_RESPONSE.menus.find((m) => m.key === key)?.label ||
        key,
    }));

  return (
    <View style={{
      flex: 1, backgroundColor: "#FFF",
    }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            menus={visibleMenus}
          />
        )}
      >
        {visibleMenus.map((menu) => (
          <Tab.Screen
            key={menu.key}
            name={menu.label}
            component={menu.component}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: hp(8),
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(2),
    borderRadius: wp(10),
    marginHorizontal: wp(2),
    marginBottom: hp(1),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  icon: {
    width: wp(7),
    height: wp(7),
  },
  label: {
    fontSize: wp(2.4),
    fontFamily: "Poppins_500Medium",
  },
});