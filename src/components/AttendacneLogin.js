import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import VersionUpgradeModal from "./VersionUpgradeModal";

export default function AttHeader({
  openMenu,
  headerL,
  openLanguageMenu,
  notificationCount = "0",
}) {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [logoutVisible, setLogoutVisible] = useState(false);

  const notifCountNum = Number(notificationCount) || 0;

  useEffect(() => {
    if (notifCountNum > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [notifCountNum]);

  const handleLogout = async () => {
    try {
      setLogoutVisible(false);

      await AsyncStorage.clear();

      navigation.reset({
        index: 0,
        routes: [{ name: "MobileLogin" }],
      });
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/yuvLog.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.rightContainer}>
          <Pressable
            style={styles.iconContainer}
            onPress={() => setLogoutVisible(true)}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Image
                source={require("../../assets/logouticon.png")}
                style={styles.icon}
              />

              {notifCountNum > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notifCountNum > 9 ? "9+" : notifCountNum}
                  </Text>
                </View>
              )}
            </Animated.View>
          </Pressable>

          <VersionUpgradeModal />
        </View>
      </View>

      {/* Logout Popup */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Logout</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp(2),
    height: wp(20),
    justifyContent: "space-between",
  },

  logoContainer: {
    flex: 1,
  },

  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    padding: wp(1),
    marginHorizontal: wp(0.8),
  },

  icon: {
    width: wp(10),
    height: wp(10),
    resizeMode: "contain",
    borderRadius: wp(1),
    backgroundColor: "#f0f0f0",
    padding: wp(1),
  },

  logo: {
    width: wp(60),
    height: hp(28),
    resizeMode: "cover",
    marginTop: hp(1),
  },

  badge: {
    position: "absolute",
    top: wp(-1.5),
    right: wp(-0.8),
    minWidth: wp(4.7),
    height: wp(4.7),
    borderRadius: wp(2.35),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(1),
    borderColor: "#fff",
    borderWidth: wp(0.4),
  },

  badgeText: {
    color: "#fff",
    fontSize: wp(2.5),
    fontFamily: "Poppins_600SemiBold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(5),
    elevation: 5,
  },

  modalTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    marginBottom: hp(1),
  },

  modalMessage: {
    fontSize: wp(3.8),
    color: "#555",
    textAlign: "center",
    marginBottom: hp(2.5),
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalButton: {
    flex: 1,
    paddingVertical: hp(1.3),
    borderRadius: wp(2),
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#F2F2F2",
    marginRight: wp(2),
  },

  logoutButton: {
    backgroundColor: COLORS.primary,
    marginLeft: wp(2),
  },

  cancelText: {
    color: "#333",
    fontWeight: "600",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
});