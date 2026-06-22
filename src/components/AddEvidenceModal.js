import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Icon } from "react-native-elements";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import ImageViewerModal from "./ImageViewver";
import CustomSingleDatePickerModal from "./SingleDateSelect";

export default function AddEvidenceModal({
    visible,
    onClose,
    onSubmit, statusList
}) {
    const [description, setDescription] = useState("");
    const [media, setMedia] = useState([]);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    // use this as an drop data on selct on this show confim modal of all and if requiresDetails is true all fields required if calendar required get date show that message on confirm modala and compile full code 

    // statusList this is dropDonw data 
    // [{"key":"start_travel","label":"Start Travelling","requiresDetails":false,"getCalendar":false,"getImage":false,"getDescription":false,"message":"Are you sure you want to start travelling?"},{"key":"cancel_meeting","label":"Cancelled","requiresDetails":false,"getCalendar":false,"getImage":true,"getDescription":true,"message":"Are you sure you want to cancel the meeting?"},{"key":"reschedule_meeting","label":"Rescheduled","requiresDetails":true,"getCalendar":true,"getImage":true,"getDescription":true,"message":"Are you sure you want to reschedule the meeting?"}] JSON.stringify(data?.status)


    useEffect(() => {
        const showSub = Keyboard.addListener(
            "keyboardDidShow",
            () => setIsKeyboardOpen(true)
        );

        const hideSub = Keyboard.addListener(
            "keyboardDidHide",
            () => setIsKeyboardOpen(false)
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const captureImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            setMedia((prev) => [
                ...prev,
                {
                    type: "image",
                    ...result.assets[0],
                },
            ]);
        }
    };

    const captureVideo = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 0.7,
        });

        if (!result.canceled) {
            setMedia((prev) => [
                ...prev,
                {
                    type: "video",
                    ...result.assets[0],
                },
            ]);
        }
    };

    const removeMedia = (index) => {
        setMedia((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        onSubmit?.({
            description,
            media,
        });

        setDescription("");
        setMedia([]);
        onClose();
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable
                style={[styles.overlay, {
                }]}
                onPress={onClose}
            >
                <Pressable
                    style={styles.container}
                    onPress={(e) => e.stopPropagation()}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{
                                paddingBottom: isKeyboardOpen
                                    ? hp(40)
                                    : hp(2),
                            }}
                        >
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    Attach Supporting Evidence
                                </Text>
                                <TouchableOpacity onPress={onClose} style={
                                    {
                                        backgroundColor: COLORS?.primary + 22, padding: wp(1),
                                        borderRadius: wp(2)
                                    }
                                }>
                                    <Icon
                                        name="x"
                                        type="feather"
                                        size={wp(5)}
                                        color={COLORS.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.mediaBtn}
                                    onPress={captureImage}
                                >
                                    <Icon
                                        name="camera"
                                        type="feather"
                                        size={wp(6)}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.mediaText}>
                                        Capture Image
                                    </Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity
                                    style={styles.mediaBtn}
                                    onPress={captureVideo}
                                >
                                    <Icon
                                        name="video"
                                        type="feather"
                                        size={wp(6)}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.mediaText}>
                                        Capture Video
                                    </Text>
                                </TouchableOpacity> */}
                            </View>
                            {media?.length > 0 && (
                                <View style={styles.gridContainer}>
                                    {media.map((item, index) => (
                                        <View
                                            key={`${item.uri}-${index}`}
                                            style={styles.gridItem}
                                        >
                                            <TouchableOpacity
                                                style={styles.removeBtn}
                                                onPress={() =>
                                                    removeMedia(index)
                                                }
                                            >
                                                <Icon
                                                    name="x"
                                                    type="feather"
                                                    size={16}
                                                    color="#fff"
                                                />
                                            </TouchableOpacity>


                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => {
                                                    setSelectedImage(item.uri);
                                                    setViewerVisible(true);
                                                }}
                                            >
                                                <Image
                                                    source={{ uri: item.uri }}
                                                    style={styles.mediaPreview}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>

                                        </View>
                                    ))}
                                </View>
                            )}

                            <ImageViewerModal
                                visible={viewerVisible}
                                uri={selectedImage}
                                onClose={() =>
                                    setViewerVisible(false)
                                }
                            />

                            {/* Description */}
                            <Text style={styles.label}>
                                Description
                            </Text>

                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                placeholder="Enter description..."
                                style={styles.descriptionInput}
                            />

                            {/* Submit */}
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitText}>
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                        {showDatePicker && (
                            <CustomSingleDatePickerModal
                                disablePastDates={true}
                                restrictFeatureDate={false}
                                visible={showDatePicker}
                                initialDate={dueDate ? dayjs(dueDate) : new Date()}
                                onClose={() => setShowDatePicker(false)}
                                onConfirm={(selectedDate) => {
                                    const parsed = dayjs(selectedDate);
                                    setDueDate(selectedDate);
                                    setDueDateText(parsed.format("DD/MM/YYYY HH:mm"));
                                    setShowDatePicker(false);
                                }}
                            />
                        )}
                    </KeyboardAvoidingView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end",
    },
    container: { backgroundColor: "#fff", borderTopLeftRadius: wp(5), borderTopRightRadius: wp(5), padding: wp(5), maxHeight: hp(85), },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: hp(2), padding: wp(2)
    }, title: {
        fontSize: wp(4.8), color: COLORS.primary,
        fontFamily: "Poppins_600SemiBold",
    },
    buttonRow: {
        flexDirection: "row", justifyContent: "space-between", marginBottom: hp(2),
    }, mediaBtn: {
        width: "100%", borderWidth: 1, borderColor: COLORS.primary + "30",
        borderRadius: wp(3), paddingVertical: hp(4), alignItems: "center", alignSelf: "center"
    }, mediaText: { marginTop: hp(1), fontFamily: "Poppins_500Medium", fontSize: wp(3.6), },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: hp(2),
    }, gridItem: {
        width: "32%",
        height: hp(12), marginBottom: hp(1.5), borderRadius: wp(3), overflow: "hidden", backgroundColor: "#f5f5f5", position: "relative",
    },
    mediaPreview: { width: "100%", height: "100%", },
    removeBtn: {
        position: "absolute", top: 5, right: 5,
        width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center", alignItems: "center", zIndex: 10,
    }, label: {
        fontSize: wp(4), color: "#000", marginBottom: hp(1),
        fontFamily: "Poppins_500Medium",
    },
    descriptionInput: {
        minHeight: hp(15), borderWidth: 1, borderColor: "#ddd", borderRadius: wp(3),
        padding: wp(3), textAlignVertical: "top", fontFamily: "Poppins_400Regular",
    },

    submitBtn: {
        backgroundColor: COLORS.primary, marginTop: hp(3), paddingVertical: hp(1.7), borderRadius: wp(3),
        alignItems: "center",
    }, submitText: {
        color: "#fff", fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
    },
});