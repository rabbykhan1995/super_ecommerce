import api from "./api";
import AuthHelper from "./auth";

let GoogleSignin: any = null;

async function getGoogleSignin() {
  if (!GoogleSignin) {
    const mod = await import("@react-native-google-signin/google-signin");
    console.log(
      "started"
    )
    GoogleSignin = mod.GoogleSignin;
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }
  return GoogleSignin;
}

export async function signInWithGoogle() {
  console.log("1. signInWithGoogle started");

  const googleSignin = await getGoogleSignin();
  console.log("2. GoogleSignin loaded");

  await googleSignin.hasPlayServices();
  console.log("3. Play Services OK");

  const userInfo = await googleSignin.signIn();
  console.log("4. Google sign-in completed", userInfo);

  const idToken = userInfo.data?.idToken;
  console.log("5. ID token exists:", !!idToken);

  if (!idToken) {
    throw new Error("No ID token received from Google");
  }

  console.log("6. Calling backend");

  const res = await api.post("/auth/mobile-google-auth", { idToken });

  console.log("7. Backend response", res.data);

  const { token, data: user } = res.data;

  await AuthHelper.setToken(token);

  return { token, user };
}