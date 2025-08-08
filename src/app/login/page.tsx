/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { verifyToken } from "@/utils/verifyToken";
import { setUser, TUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useGetMeMutation } from "@/redux/features/currentUser/currentUserApi";
import { setCurrentUser } from "@/redux/features/currentUser/currentUserSlice";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [getMe] = useGetMeMutation();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({ phone, password }).unwrap();
      console.log("Login success:", result);

      if (result?.data?.accessToken) {
        localStorage.setItem("accessToken", result?.data?.accessToken);

        const user = verifyToken(result.data.accessToken) as TUser;
        dispatch(setUser({ user, token: result.data.accessToken }));
      }

      // ✅ Fetch current user and store in currentUser slice
      const res = await getMe().unwrap();
      dispatch(setCurrentUser(res.data));

      // ✅ Redirect to home
      router.push("/");
    } catch (err: any) {
      console.error("Login failed:", err.message || err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-center items-center h-[80vh] gap-8">
        <div className="w-[40%]">
          <h2 className="text-3xl font-bold mb-4 text-green-700">
            Sign In to FarmFlow
          </h2>
          <p className="text-gray-700 text-lg">
            Welcome to FarmFlow – your gateway to smarter farming. Log in to
            monitor real-time field data including temperature, humidity, soil
            moisture, and light intensity. Access AI-powered insights customized
            for your crops, and join a growing community of informed farmers.
          </p>
        </div>
        <div className="flex-1 max-w-md">
          <div className="border shadow-md rounded-lg p-6 border-gray-200">
            <h3 className="text-2xl font-semibold mb-6 text-green-700">
              Login
            </h3>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  defaultValue={"01812345671"}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-green-50 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-700"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  defaultValue="faham@farmflow"
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-green-50 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-700"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-800 text-white py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
