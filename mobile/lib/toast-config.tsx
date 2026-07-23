import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#22C55E", backgroundColor: "#F0FDF4" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 14, fontWeight: "600" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#EF4444", backgroundColor: "#FEF2F2" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 14, fontWeight: "600" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
};
