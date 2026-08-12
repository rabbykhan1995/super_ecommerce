import api from "./api";
import AuthHelper from "./auth";

let GoogleSignin: any = null;

async function getGoogleSignin() {
  if (!GoogleSignin) {
    const mod = await import("@react-native-google-signin/google-signin");

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


  await googleSignin.hasPlayServices();


  const userInfo = await googleSignin.signIn();


  const idToken = userInfo.data?.idToken;


  if (!idToken) {
    throw new Error("No ID token received from Google");
  }

  const res = await api.post("/auth/mobile-google-auth", { idToken });



  const { token, data: user } = res.data;

  await AuthHelper.setToken(token);

  return { token, user };
}