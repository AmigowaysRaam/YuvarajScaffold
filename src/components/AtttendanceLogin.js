import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import AttHeader from "./AttendacneLogin";
import LocationPermissionModal from "./LocationPermissionModal";

export default function AttendanceLoginScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [attendanceData, setAttendanceData] = useState(null);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const { showToast } = useToast();
    const cameraRef = useRef(null);
    const [location, setLocation] = useState(null);
    useEffect(() => {
        if (!permission) return;

        if (!permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const playAudio = async (type = "success") => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                type === "success"
                    ? require("../../assets/loginSuccess.mp3")
                    : require("../../assets/loginFailed.mp3")
            );
            await sound.playAsync();

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            console.log("Audio Error:", error);
        }
    };

    const captureAndUpload = async () => {
        try {
            if (!cameraRef.current) return;
            if (!location) {
                showToast("Waiting for location...", "error");
                return;
            }

            setLoading(true);

            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
            });
            // console.log("Photo URI:", photo.uri);
            const formData = new FormData();
            formData.append("faceImage", {
                uri: photo.uri,
                name: "attendance.jpg",
                type: "image/jpeg",
            });
            formData.append("latitude", location.latitude);
            formData.append("longitude", location.longitude);
            console.log("Form Data :", formData);
            const response = await fetch(
                "https://hrms.yuvarajscaffoldingtraders.com/api/?url=face-attendance-mark",
                {
                    method: "POST",
                    headers: {
                        // Authorization: "YOUR_TOKEN_HERE",
                        Accept: "application/json",
                    },
                    body: formData,
                }
            );
            const result = await response.json();
            if (result?.success) {
                await playAudio("success");
                console.log("Attendance Result:", result);
                setAttendanceData({
                    name: result.employee?.name,
                    employeeId: result.employee?.employeeId,
                    photo: result.employee?.employeeImage,
                    message: result.message,
                    loginTime: result?.loginDate,
                    action: result.action,
                    confidence: result.confidence,
                });

                setShowSuccessCard(true);

                setTimeout(() => {
                    setShowSuccessCard(false);
                    setAttendanceData(null);
                }, 2500);

                showToast(result.message, "success");
            } else {
                await playAudio("failed");
                showToast(result?.message || "Attendance Failed", "error");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            await playAudio("failed");
            showToast("Error Capturing Attendance", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Ionicons
                    name="camera-outline"
                    size={60}
                    color="#2563EB"
                />
                <Text style={styles.permissionText}>
                    Camera Permission Required
                </Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <AttHeader
                title="Attendance Login"
                showBackButton={false}
            // onBackPress={() => navigation.goBack()}
            />
            <View style={styles.contentContainer}>
                {/* Camera Card */}
                <View style={styles.cameraCard}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="front"
                    />
                </View>

                {/* View Attendance Log Button */}
                {/* <TouchableOpacity
                    style={styles.logButton}
                    onPress={() =>
                        navigation.navigate("AttendanceActivity")
                    }
                >
                    <Ionicons
                        name="eye-outline"
                        size={20}
                        color="#2563EB"
                    />
                    <Text style={styles.logButtonText}>
                        View Attendance Log
                    </Text>
                </TouchableOpacity> */}

                {/* Mark Attendance Button */}
                <TouchableOpacity
                    style={[
                        styles.captureButton,
                        loading && { opacity: 0.7 },
                        {
                            borderWidth: wp(1),
                            borderColor: COLORS.primary + '55',
                            borderRadius: wp(5),
                        }
                    ]}
                    onPress={captureAndUpload}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator color="#fff" />
                            <Text style={styles.captureButtonText}>
                                Uploading...
                            </Text>
                        </>
                    ) : (
                        <>
                            <Ionicons
                                name="camera"
                                size={22}
                                color="#fff"
                            />
                            <Text style={styles.captureButtonText}>
                                Mark Attendance
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <LocationPermissionModal
                onLocationReceived={(coords) => {
                    setLocation(coords);
                }}
            />

            {/* Success Modal */}
            <Modal
                visible={showSuccessCard}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successCard}>

                        <Ionicons
                            name="checkmark-circle"
                            size={80}
                            color="#16A34A"
                        />
                        {
                            attendanceData?.photo && (
                                <Image source={{ uri: attendanceData?.photo }} style={styles.employeeImage} />
                            )
                        }
                        <Text style={styles.successHeading}>
                            Attendance Success
                        </Text>

                        <Text style={styles.employeeName}>
                            {attendanceData?.name}
                        </Text>

                        <Text style={styles.employeeId}>
                            Employee ID: {attendanceData?.employeeId}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.successMessage}>
                            {attendanceData?.message}
                        </Text>

                        <TouchableOpacity
                            style={styles.okButton}
                            onPress={() =>
                                setShowSuccessCard(false)
                            }
                        >
                            <Text style={styles.okButtonText}>
                                OK
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Loader */}
            <Modal
                visible={loading}
                transparent
                animationType="fade"
            >
                <View style={styles.loaderContainer}>
                    <View style={styles.loaderCard}>
                        <ActivityIndicator
                            size="large"
                            color="#2563EB"
                        />

                        <Text style={styles.loaderTitle}>
                            Processing Attendance
                        </Text>

                        <Text style={styles.loaderSubtitle}>
                            Capturing image and verifying face...
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: "#000",
    },
    camera: { flex: 1, }, modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center",
    }, successCard: {
        width: "88%", backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center", elevation: 12,
    }, successHeading: {
        marginTop: 10, fontSize: 22, fontWeight: "700", color: "#111827",
    }, employeeImage: {
        width: wp(15), height: wp(15), borderRadius: 55,
        marginTop: 18, borderWidth: 3, borderColor: "#16A34A",
    }, employeeName: {
        marginTop: 12, fontSize: 22, fontWeight: "700", color: "#111827",
        textTransform: "capitalize",
    }, employeeId: { marginTop: 4, fontSize: 15, color: "#6B7280", }, divider: {
        width: "100%", height: 1, backgroundColor: "#E5E7EB", marginVertical: 18,
    }, successMessage: {
        fontSize: 16, fontWeight: "700", color: "#16A34A", textAlign: "center",
    }, infoLabel: { marginTop: 16, fontSize: 14, color: "#6B7280", }, dateText: {
        marginTop: 6, fontSize: 16, color: "#374151",
    }, timeText: { marginTop: 4, fontSize: 22, fontWeight: "700", color: "#111827", }, okButton: {
        marginTop: 24, backgroundColor: "#2563EB", width: "100%", paddingVertical: 14,
        borderRadius: 14, alignItems: "center",
    }, okButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", }, logButton: {
        position: "absolute", top: 60, right: 20, flexDirection: "row",
        alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4, },
        shadowOpacity: 0.15, shadowRadius: 6, elevation: 6,
    }, logButtonText: { color: "#2563EB", fontWeight: "700", marginLeft: 6, fontSize: 13, }, captureButton: {
        position: "absolute", bottom: 40, alignSelf: "center", backgroundColor: "#2563EB", flexDirection: "row", alignItems: "center",
        justifyContent: "center", paddingHorizontal: 28, paddingVertical: 16,
        borderRadius: 18, minWidth: wp(65), shadowColor: "#2563EB", shadowOffset: { width: 0, height: 6, },
        shadowOpacity: 0.35, shadowRadius: 8, elevation: 10,
    }, captureButtonText: {
        color: "#fff", fontSize: wp(4.6),
        fontFamily: "Poppins_600SemiBold",
        marginLeft: hp(2), lineHeight: hp(2),

    }, center: {
        flex: 1, justifyContent: "center", alignItems: "center",
    }, loaderContainer: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center",
    }, loaderCard: {
        width: "85%", backgroundColor: "#fff",
        paddingVertical: 35, paddingHorizontal: 25, borderRadius: 24,
        alignItems: "center", shadowColor: "#000", shadowOffset: {
            width: 0, height: 8,
        }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8,
    }, loaderTitle: {
        marginTop: 20, fontSize: 20, fontWeight: "700", color: "#111827",
    }, loaderSubtitle: {
        marginTop: 10, textAlign: "center", fontSize: 15, color: "#6B7280", lineHeight: 22,
    },
    permissionText: { marginTop: 10, fontSize: 16, fontWeight: "600", },
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    contentContainer: {
        flex: 1,
        padding: wp(2),
        justifyContent: "center",
    },
    cameraCard: {
        height: hp(62),
        backgroundColor: "#fff",
        borderRadius: wp(5),
        overflow: "hidden",
    },
    camera: {
        flex: 1,
    },
    logButton: {
        marginTop: wp(5),
        backgroundColor: "#fff",
        borderRadius: wp(4),
        paddingVertical: wp(5),
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },

    logButtonText: {
        marginLeft: 8,
        fontSize: 15,
        fontWeight: "700",
        color: "#2563EB",
    },
    captureButton: {
        marginTop: wp(4),
        backgroundColor: COLORS.primary,
        borderRadius: wp(4),
        paddingVertical: wp(7),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#2563EB",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,

        elevation: 8,
    },

});