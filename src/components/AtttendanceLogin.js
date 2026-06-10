import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text,
    TouchableOpacity, View,
} from "react-native";
import { wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";

export default function AttendanceLoginScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    const [attendanceData, setAttendanceData] = useState(null);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const { showToast } = useToast();
    const cameraRef = useRef(null);

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

            setLoading(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
            });
            console.log("Photo URI:", photo.uri);
            const formData = new FormData();
            formData.append("faceImage", {
                uri: photo.uri,
                name: "attendance.jpg",
                type: "image/jpeg",
            });
            console.log(JSON.stringify(formData), "photo");
            const response = await fetch(
                "https://hrms.yuvarajscaffoldingtraders.com/api/?=face-attendance-mark",
                {
                    method: "POST",
                    body: formData,
                }
            );
            
            const text = await response.text();
            
            console.log("Status:", response.status);
            console.log("Response:", text);
            
            Alert.alert(
                "API Response",
                text.substring(0, 500)
            );
            Alert.alert("Attendance Response",JSON.stringify(response));
            const result = await response.json();
            console.log(response, "response");
            // if (result) {
            //     await playAudio("success");
            //     setTimeout(() => {
            //         setShowSuccessCard(false);
            //         setAttendanceData(null);
            //     }, 1300);
            //     setShowSuccessCard(true);
            //     showToast(result?.message, "success");
            //     setAttendanceData({
            //         name: "Yuvaraj",
            //         employeeId: "YST001",
            //         photo:
            //             "https://randomuser.me/api/portraits/men/32.jpg",
            //         message: "Attendance Logged Successfully",
            //         loginTime: new Date(),
            //     });
            // } else {
            //     await playAudio("failed");
            //     showToast(
            //         result?.message || "Attendance Failed",
            //         "error"
            //     );
            // }
        } catch (error) {
            console.log(error);
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
            
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
            />
            {/* Attendance Log Button */}
            <Pressable
                style={styles.logButton}
                onPress={() => navigation.navigate("AttendanceActivity")}
            >
                <Ionicons
                    name="eye-outline"
                    size={20}
                    color="#2563EB"
                />

                <Text style={styles.logButtonText}>
                    VIEW ATTENDANCE LOG
                </Text>
            </Pressable>
            <TouchableOpacity
                style={[
                    styles.captureButton,
                    loading && { opacity: 0.8 },
                ]}
                onPress={captureAndUpload}
                disabled={loading}
                activeOpacity={0.9}
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

                        <Text style={styles.successHeading}>
                            Attendance Success
                        </Text>

                        <Image
                            source={{
                                uri: attendanceData?.photo,
                            }}
                            style={styles.employeeImage}
                        />

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

                        <Text style={styles.infoLabel}>
                            Logged In At
                        </Text>

                        <Text style={styles.dateText}>
                            {attendanceData?.loginTime?.toLocaleDateString()}
                        </Text>

                        <Text style={styles.timeText}>
                            {attendanceData?.loginTime?.toLocaleTimeString()}
                        </Text>

                        <TouchableOpacity
                            style={styles.okButton}
                            onPress={() => setShowSuccessCard(false)}
                        >
                            <Text style={styles.okButtonText}>
                                OK
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={loading}
                transparent={false}
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
        flex: 1,
        backgroundColor: "#000",
    },
    camera: { flex: 1, }, modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center",
    }, successCard: {
        width: "88%", backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center", elevation: 12,
    },
    successHeading: {
        marginTop: 10, fontSize: 22, fontWeight: "700", color: "#111827",
    }, employeeImage: {
        width: 110, height: 110, borderRadius: 55,
        marginTop: 18, borderWidth: 3, borderColor: "#16A34A",
    }, employeeName: { marginTop: 12, fontSize: 22, fontWeight: "700", color: "#111827", },
    employeeId: { marginTop: 4, fontSize: 15, color: "#6B7280", }, divider: {
        width: "100%", height: 1, backgroundColor: "#E5E7EB", marginVertical: 18,
    },
    successMessage: {
        fontSize: 16, fontWeight: "700", color: "#16A34A", textAlign: "center",
    },
    infoLabel: { marginTop: 16, fontSize: 14, color: "#6B7280", }, dateText: {
        marginTop: 6, fontSize: 16, color: "#374151",
    }, timeText: {
        marginTop: 4, fontSize: 22, fontWeight: "700", color: "#111827",
    }, okButton: {
        marginTop: 24, backgroundColor: "#2563EB", width: "100%", paddingVertical: 14,
        borderRadius: 14, alignItems: "center",
    }, okButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", }, logButton: {
        position: "absolute", top: 60, right: 20, flexDirection: "row",
        alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4, },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    }, logButtonText: {
        color: "#2563EB", fontWeight: "700",
        marginLeft: 6,
        fontSize: 13,
    },
    captureButton: {
        position: "absolute", bottom: 40,
        alignSelf: "center", backgroundColor: "#2563EB", flexDirection: "row", alignItems: "center",
        justifyContent: "center", paddingHorizontal: 28, paddingVertical: 16,
        borderRadius: 18,
        minWidth: wp(65), shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 6, },
        shadowOpacity: 0.35,
        shadowRadius: 8, elevation: 10,
    },
    captureButtonText: {
        color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: 8,
    },
    center: {
        flex: 1, justifyContent: "center", alignItems: "center",
    },
    loaderContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
    },

    loaderCard: {
        width: "85%",
        backgroundColor: "#fff",
        paddingVertical: 35, paddingHorizontal: 25, borderRadius: 24,
        alignItems: "center",
        shadowColor: "#000", shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10, elevation: 8,
    },
    loaderTitle: {
        marginTop: 20,
        fontSize: 20, fontWeight: "700", color: "#111827",
    },
    loaderSubtitle: {
        marginTop: 10, textAlign: "center", fontSize: 15,
        color: "#6B7280", lineHeight: 22,
    },
    permissionText: {
        marginTop: 10, fontSize: 16, fontWeight: "600",
    },
});