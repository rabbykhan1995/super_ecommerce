import api from "@/lib/api";
import { useUserStore } from "@/store/user.store";
import { checkoutMobileSchema } from "@/validation/validation";
import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CompleteProfileModal = () => {
  const { user, fetchUser } = useUserStore();

  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user?.address]);

  const handleSubmit = async () => {
    const payload = {
      mobile: mobile.trim(),
      address: address.trim(),
    };

    const validation = checkoutMobileSchema.safeParse(payload);

    if (!validation.success) {
      const error = validation.error.issues[0];

      Toast.show({
        type: "error",
        text1:
          error.path[0] === "mobile"
            ? "Invalid Mobile Number"
            : "Invalid Address",
        text2: error.message,
        position: "top",
        visibilityTime: 3000,
      });

      return;
    }

    setLoading(true);

    try {
      await api.post(
        "/auth/checkout-mobile",
        validation.data
      );

      // Backend থেকে latest user/contact নিয়ে আসবে
      await fetchUser();

      Toast.show({
        type: "success",
        text1: "Profile completed successfully",
        position: "top",
        visibilityTime: 3000,
      });

      setMobile("");
      setAddress("");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Failed to complete profile";

      Toast.show({
        type: "error",
        text1: "Failed",
        text2: message,
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (user.contact !== null) {
    return null;
  }

  return (
    <Modal
      visible={user.contact === null}
      transparent
      animationType="fade"
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Complete Your Profile
            </Text>

            <Text style={styles.subText}>
              Please add your mobile number to complete your profile.
            </Text>
          </View>

          {/* Mobile */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>
              Mobile Number
            </Text>

            <TextInput
              placeholder="+880 1XXXXXXXXX"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
              style={styles.input}
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Address */}
          <View style={styles.inputWrapper}>
            <View style={styles.addressHeader}>
              <Text style={styles.label}>
                Address
              </Text>

              <Text style={styles.optionalText}>
                Optional
              </Text>
            </View>

            <TextInput
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
              style={[
                styles.input,
                styles.addressInput,
              ]}
              multiline
              textAlignVertical="top"
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Submit */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                loading && styles.disabledButton,
              ]}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sending..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },

  subText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  inputWrapper: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionalText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 48,
    backgroundColor: "#fff",
  },

  addressInput: {
    minHeight: 80,
  },

  buttonWrapper: {
    marginTop: 24,
  },

  submitButton: {
    width: "100%",
    padding: 12,
    backgroundColor: "#F7311E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CompleteProfileModal;