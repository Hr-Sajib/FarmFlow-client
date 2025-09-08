/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { toast } from "react-hot-toast";

// Type for the upload response
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

// Function to upload a single image to Cloudinary
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error("No image file selected");
    }

    // Create FormData for Cloudinary upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    // Log for debugging
    console.log("uploadImageToCloudinary: Initiating upload", {
      fileName: file.name,
      fileSize: file.size,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    });

    // Make the upload request
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    // Check response status
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log("uploadImageToCloudinary: Upload successful", {
      secureUrl: data.secure_url,
      publicId: data.public_id,
    });

    return data.secure_url;
  } catch (error: any) {
    console.error("uploadImageToCloudinary: Error", error.message);
    toast.error(`Failed to upload image: ${error.message}`);
    throw error;
  }
};

// import axios from "axios";

// export const postImage = async (file: File): Promise<string> => {
//   const formData = new FormData();
//   formData.append("key", "1c611875f6706fbb73909bc6c876e775"); // Your API key (if required by the new endpoint)
//   formData.append("image", file); // Binary file for upload
//   // Optional: Add expiration (if supported by the new API)
//   formData.append("expiration", "600");

//   try {
//     const response = await axios.post(
//       "https://api.empowernextgenbd.com/imgbb.php",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     // Adjust this based on the actual response structure from the new API
//     const result = response.data;
//     if (result.success && result.data?.url) {
//       return result.data.url; // Return the direct image URL
//     } else {
//       throw new Error(result.error?.message || "Failed to upload image");
//     }
//   } catch (error) {
//     console.error("Image upload failed:", error);
//     throw error;
//   }
// };

// // utils/postImage.ts
// export const postImage = async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append("key", "1c611875f6706fbb73909bc6c876e775"); // Your ImgBB API key
//     formData.append("image", file); // Binary file for upload
//     // Optional: Add expiration (e.g., 600 seconds = 10 minutes)
//     formData.append("expiration", "600");

//     try {
//       const response = await fetch("https://api.imgbb.com/1/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();
//       if (result.success && result.status === 200 && result.data?.url) {
//         return result.data.url; // Return the direct image URL
//       } else {
//         throw new Error(result.error?.message || "Failed to upload image to ImgBB");
//       }
//     } catch (error) {
//       console.error("Image upload failed:", error);
//       throw error;
//     }
//   };
