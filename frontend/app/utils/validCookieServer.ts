import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function checkCookiesServer(){
  console.log('hi')
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  if (!token) {
    console.log("No token found, redirecting to login.");
    redirect("/login");
  }
  return
}