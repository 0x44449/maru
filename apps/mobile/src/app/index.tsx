import { Redirect } from "expo-router";

export default function Index() {
  // TODO: 실제 인증 상태에 따라 분기
  return <Redirect href="/login" />;
}
