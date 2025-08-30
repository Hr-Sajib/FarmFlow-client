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
import { toast } from "react-hot-toast";

interface LoginError {
  success: boolean;
  message: string;
  errorSources: { path: string; message: string }[];
  err: { statusCode?: number; issues?: { message: string }[]; name?: string };
  stack?: string;
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [getMe] = useGetMeMutation();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password) {
      toast.error("Phone number and password are required");
      return;
    }

    try {
      const result = await login({ phone, password }).unwrap();
      console.log("Login success:", result);

      if (result?.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        try {
          const user = verifyToken(result.data.accessToken) as TUser;
          dispatch(setUser({ user, token: result.data.accessToken }));
        } catch (tokenErr) {
          console.error("Token verification failed:", tokenErr);
          toast.error("Invalid authentication token");
          return;
        }
      } else {
        throw new Error("No access token received");
      }

      const res = await getMe().unwrap();
      if (!res?.data) {
        console.error("Failed to fetch user data:", res);
        toast.error("Failed to fetch user data");
        return;
      }
      dispatch(setCurrentUser(res.data));

      toast.success("Login successful");
      router.push("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      const loginError = err as { data?: LoginError; message?: string };
      if (loginError.data && !loginError.data.success) {
        const { message, errorSources, err } = loginError.data;
        const errorMessage = errorSources[0]?.message || message || "Login failed";
        if (err.statusCode === 401) {
          toast.error("Invalid phone number or password");
        } else if (err.name === "ZodError") {
          toast.error(errorMessage || "Invalid input provided");
        } else if (err.statusCode === 404) {
          toast.error("User not found");
        } else if (err.statusCode === 500) {
          toast.error("Server error, please try again later");
        } else {
          toast.error(errorMessage);
        }
      } else if (err.message === "No access token received") {
        toast.error("Authentication failed: No token received");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-center items-center h-[80vh] gap-8">
        <div className="w-[40%]">
          <h2 className="text-3xl font-bold mb-4 text-green-700">
            Start your journey with FarmFlow
          </h2>
          <p className="text-gray-700 text-lg">
            Welcome to FarmFlow – your gateway to smarter farming. Log in to
            monitor real-time field data including temperature, humidity, soil
            moisture, and light intensity. Access AI-powered insights customized
            for your crops, chat with AI assistant, and join a growing community of informed farmers.
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-green-50 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-700"
                  placeholder="Enter phone number"
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
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-green-50 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-700"
                  placeholder="Enter password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-800 text-white py-2 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:bg-green-600 disabled:cursor-not-allowed"
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
// /* eslint-disable @typescript-eslint/no-explicit-any */

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useLoginMutation } from "@/redux/features/auth/authApi";
// import { verifyToken } from "@/utils/verifyToken";
// import { setUser, TUser } from "@/redux/features/auth/authSlice";
// import { useAppDispatch } from "@/redux/hooks";
// import { useGetMeMutation } from "@/redux/features/currentUser/currentUserApi";
// import { setCurrentUser } from "@/redux/features/currentUser/currentUserSlice";

// export default function LoginPage() {
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   const [getMe] = useGetMeMutation();
//   const [login, { isLoading }] = useLoginMutation();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const result = await login({ phone, password }).unwrap();
//       console.log("Login success:", result);

//       if (result?.data?.accessToken) {
//         localStorage.setItem("accessToken", result?.data?.accessToken);

//         const user = verifyToken(result.data.accessToken) as TUser;
//         dispatch(setUser({ user, token: result.data.accessToken }));
//       }

//       // ✅ Fetch current user and store in currentUser slice
//       const res = await getMe().unwrap();
//       dispatch(setCurrentUser(res.data));

//       // ✅ Redirect to home
//       router.push("/");
//     } catch (err: any) {
//       console.error("Login failed:", err.message || err);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-center items-center h-[80vh] gap-8">
//         <div className="w-[40%]">
//           <h2 className="text-3xl font-bold mb-4 text-green-700">
//             Start your journy with FarmFlow
//           </h2>
//           <p className="text-gray-700 text-lg">
//             Welcome to FarmFlow – your gateway to smarter farming. Log in to
//             monitor real-time field data including temperature, humidity, soil
//             moisture, and light intensity. Access AI-powered insights customized
//             for your crops, Chat with AI assistant and join a growing community of informed farmers.
//           </p>
//         </div>
//         <div className="flex-1 max-w-md">
//           <div className="border shadow-md rounded-lg p-6 border-gray-200">
//             <h3 className="text-2xl font-semibold mb-6 text-green-700">
//               Login
//             </h3>
//             <form className="space-y-4" onSubmit={handleLogin}>
//               <div>
//                 <label
//                   htmlFor="phone"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   id="phone"
//                   onChange={(e) => setPhone(e.target.value)}
//                   className="mt-1 w-full px-4 py-2 bg-green-50 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-700"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Password
//                 </label>
//                 <input
//                   id="password"
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="mt-1 w-full px-4 py-2 bg-green-50 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-700"
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="w-full bg-green-800 text-white py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Logging in..." : "Login"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
