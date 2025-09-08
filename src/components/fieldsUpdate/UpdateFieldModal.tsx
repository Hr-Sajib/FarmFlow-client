/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { TField } from '@/types/types';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useUpdateFieldMutation } from '@/redux/features/fields/fieldsApi';
import { uploadImageToCloudinary } from '@/utils/postImage';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Adjust path to your Redux store

const FieldMap = dynamic(() => import('@/components/fieldsUpdate/Map'), { ssr: false });

type UpdateFieldModalProps = {
  field: TField;
  onClose: () => void;
};

function UpdateFieldModalComponent({ field, onClose }: UpdateFieldModalProps) {
  const currentUser = useSelector((state: RootState) => state.currentUser.currentUser);
  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState({
    fieldName: field.fieldName,
    fieldCrop: field.fieldCrop,
    fieldSizeInAcres: field.fieldSizeInAcres || '',
    soilType: field.soilType || '',
    region: field.region || '',
    fieldStatus: field.fieldStatus || 'active',
    latitude: field.fieldLocation.latitude.toString(),
    longitude: field.fieldLocation.longitude.toString(),
    fieldImage: field.fieldImage || '',
    fieldId: field.fieldId,
    farmerId: field.farmerId,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [updateField, { isLoading, isSuccess }] = useUpdateFieldMutation();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (isSuccess) {
      console.log('UpdateFieldModal: Update successful, closing modal in 2s');
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (lat: string, lng: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('UpdateFieldModal: Image selected, uploading...');
      setIsUploading(true);
      try {
        const imageUrl = await uploadImageToCloudinary(file);
        console.log('UpdateFieldModal: Image uploaded, URL:', imageUrl);
        setFormData((prev) => ({ ...prev, fieldImage: imageUrl }));
      } catch (error) {
        console.error('UpdateFieldModal: Error uploading image:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('UpdateFieldModal: Submitting update with data:', formData);

    try {

      const updateData: any = {
        fieldName: formData.fieldName,
        fieldCrop: formData.fieldCrop,
        fieldLocation: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        fieldSizeInAcres: formData.fieldSizeInAcres ? parseFloat(formData.fieldSizeInAcres.toString()) : undefined,
        soilType: formData.soilType || undefined,
        region: formData.region || undefined,
        fieldStatus: formData.fieldStatus,
        fieldImage: formData.fieldImage || undefined,
      };

      // Only include these if user is admin
      if (isAdmin) {
        updateData.fieldId = formData.fieldId;
        updateData.farmerId = formData.farmerId;
      }

      await updateField({ fieldId: field.fieldId, data: updateData }).unwrap();
      console.log('UpdateFieldModal: Update dispatched successfully');
    } catch (err) {
      console.error('UpdateFieldModal: Error updating field:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="relative p-[3px] rounded-xl shadow-2xl w-full max-w-4xl">
        <div className="bg-white rounded-[10px] p-8 flex flex-col md:flex-row gap-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-sm font-medium text-gray-700">Pick Location</h3>
            <div className="h-[350px] rounded-lg overflow-hidden border border-gray-200">
              <FieldMap
                latitude={parseFloat(formData.latitude) || 0}
                longitude={parseFloat(formData.longitude) || 0}
                onClick={handleMapClick}
              />
            </div>
            <div className="relative">
              {isUploading ? (
                <div className="w-full h-[183px] bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 text-sm">Uploading...</span>
                  </div>
                </div>
              ) : formData.fieldImage ? (
                <Image
                  src={formData.fieldImage}
                  alt={formData.fieldName}
                  width={400}
                  height={183}
                  className="w-full h-[183px] object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-[183px] bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <label className="absolute bottom-2 right-2 bg-green-800 text-white text-sm font-medium py-1 px-3 rounded-full hover:bg-green-700 transition-colors duration-300 cursor-pointer">
                Change Field Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
              <input
                type="text"
                name="fieldName"
                value={formData.fieldName}
                onChange={handleChange}
                className="w-full p-3 border-2 border-green-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                placeholder="Enter field name"
              />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Field Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                <input
                  type="text"
                  name="fieldCrop"
                  value={formData.fieldCrop}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                  placeholder="Enter crop type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Size (acres)</label>
                <input
                  type="number"
                  name="fieldSizeInAcres"
                  value={formData.fieldSizeInAcres}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                  placeholder="Enter size in acres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                >
                  <option value="">Select Soil Type</option>
                  <option value="clay">Clay</option>
                  <option value="loam">Loam</option>
                  <option value="sandy">Sandy</option>
                  <option value="silt">Silt</option>
                  <option value="peat">Peat</option>
                  <option value="chalk">Chalk</option>
                  <option value="saline">Saline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                  placeholder="Enter region"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Status</label>
                <select
                  name="fieldStatus"
                  value={formData.fieldStatus}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                    placeholder="Enter latitude"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                    placeholder="Enter longitude"
                  />
                </div>
              </div>
              {isAdmin && (
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Field ID</label>
                    <input
                      type="text"
                      name="fieldId"
                      value={formData.fieldId}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                      placeholder="Enter field ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Farmer ID</label>
                    <input
                      type="text"
                      name="farmerId"
                      value={formData.farmerId}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
                      placeholder="Enter farmer ID"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors duration-300 font-medium"
                  disabled={isLoading || isSuccess}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-green-800 text-white rounded-full hover:bg-green-700 transition-colors duration-300 font-medium disabled:bg-green-600 disabled:cursor-not-allowed"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? 'Updating...' : isSuccess ? 'Saved' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateFieldModalComponent;


// 'use client';

// import dynamic from 'next/dynamic';
// import { useState, useEffect } from 'react';
// import { TField } from '@/types/types';
// import { X } from 'lucide-react';
// import Image from 'next/image';
// import { useUpdateFieldMutation } from '@/redux/features/fields/fieldsApi';
// import {  uploadImageToCloudinary } from '@/utils/postImage';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/redux/store'; // Adjust path to your Redux store

// const FieldMap = dynamic(() => import('@/components/fieldsUpdate/Map'), { ssr: false });

// type UpdateFieldModalProps = {
//   field: TField;
//   onClose: () => void;
// };

// function UpdateFieldModalComponent({ field, onClose }: UpdateFieldModalProps) {
//   const currentUser = useSelector((state: RootState) => state.auth.user); // Adjust based on your Redux state
//   const isAdmin = currentUser?.role === 'admin';

//   const [formData, setFormData] = useState({
//     fieldName: field.fieldName,
//     fieldCrop: field.fieldCrop,
//     fieldSizeInAcres: field.fieldSizeInAcres || '',
//     soilType: field.soilType || '',
//     region: field.region || '',
//     fieldStatus: field.fieldStatus || 'active',
//     latitude: field.fieldLocation.latitude.toString(),
//     longitude: field.fieldLocation.longitude.toString(),
//     fieldImage: field.fieldImage || '',
//     fieldId: field.fieldId,
//     farmerId: field.farmerId,
//   });
//   const [isUploading, setIsUploading] = useState(false);
//   const [updateField, { isLoading, isSuccess }] = useUpdateFieldMutation();

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, []);

//   useEffect(() => {
//     if (isSuccess) {
//       console.log('UpdateFieldModal: Update successful, closing modal in 2s');
//       const timer = setTimeout(() => {
//         onClose();
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [isSuccess, onClose]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleMapClick = (lat: string, lng: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       latitude: lat,
//       longitude: lng,
//     }));
//   };

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       console.log('UpdateFieldModal: Image selected, uploading...');
//       setIsUploading(true);
//       try {
//         const imageUrl = await uploadImageToCloudinary(file);
//         console.log('UpdateFieldModal: Image uploaded, URL:', imageUrl);
//         setFormData((prev) => ({ ...prev, fieldImage: imageUrl }));
//       } catch (error) {
//         console.error('UpdateFieldModal: Error uploading image:', error);
//       } finally {
//         setIsUploading(false);
//       }
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('UpdateFieldModal: Submitting update with data:', formData);
//     try {
//       const updateData = {
//         fieldName: formData.fieldName,
//         fieldCrop: formData.fieldCrop,
//         fieldLocation: {
//           latitude: parseFloat(formData.latitude),
//           longitude: parseFloat(formData.longitude),
//         },
//         fieldSizeInAcres: formData.fieldSizeInAcres ? parseFloat(formData.fieldSizeInAcres.toString()) : undefined,
//         soilType: formData.soilType || undefined,
//         region: formData.region || undefined,
//         fieldStatus: formData.fieldStatus,
//         fieldImage: formData.fieldImage || undefined,
//         fieldId: formData.fieldId,
//         farmerId: formData.farmerId,
//       };
//       await updateField({ fieldId: field.fieldId, data: updateData }).unwrap();
//       console.log('UpdateFieldModal: Update dispatched successfully');
//     } catch (err) {
//       console.error('UpdateFieldModal: Error updating field:', err);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300">
//       <div className="relative p-[3px] rounded-xl shadow-2xl w-full max-w-4xl">
//         <div className="bg-white rounded-[10px] p-8 flex flex-col md:flex-row gap-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <div className="flex-1 flex flex-col gap-4">
//             <h3 className="text-sm font-medium text-gray-700">Pick Location</h3>
//             <div className="h-[350px] rounded-lg overflow-hidden border border-gray-200">
//               <FieldMap
//                 latitude={parseFloat(formData.latitude) || 0}
//                 longitude={parseFloat(formData.longitude) || 0}
//                 onClick={handleMapClick}
//               />
//             </div>
//             <div className="relative">
//               {isUploading ? (
//                 <div className="w-full h-[183px] bg-gray-200 rounded-lg flex items-center justify-center">
//                   <div className="flex flex-col items-center gap-2">
//                     <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
//                     <span className="text-gray-600 text-sm">Uploading...</span>
//                   </div>
//                 </div>
//               ) : formData.fieldImage ? (
//                 <Image
//                   src={formData.fieldImage}
//                   alt={formData.fieldName}
//                   width={400}
//                   height={183}
//                   className="w-full h-[183px] object-cover rounded-lg"
//                 />
//               ) : (
//                 <div className="w-full h-[183px] bg-gray-200 rounded-lg flex items-center justify-center">
//                   <span className="text-gray-500">No Image</span>
//                 </div>
//               )}
//               <label className="absolute bottom-2 right-2 bg-green-800 text-white text-sm font-medium py-1 px-3 rounded-full hover:bg-green-700 transition-colors duration-300 cursor-pointer">
//                 Change Field Image
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="hidden"
//                 />
//               </label>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
//               <input
//                 type="text"
//                 name="fieldName"
//                 value={formData.fieldName}
//                 onChange={handleChange}
//                 className="w-full p-3 border-2 border-green-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                 placeholder="Enter field name"
//               />
//             </div>
//           </div>
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Field Information</h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
//                 <input
//                   type="text"
//                   name="fieldCrop"
//                   value={formData.fieldCrop}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                   placeholder="Enter crop type"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Field Size (acres)</label>
//                 <input
//                   type="number"
//                   name="fieldSizeInAcres"
//                   value={formData.fieldSizeInAcres}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                   placeholder="Enter size in acres"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
//                 <select
//                   name="soilType"
//                   value={formData.soilType}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                 >
//                   <option value="">Select Soil Type</option>
//                   <option value="clay">Clay</option>
//                   <option value="loam">Loam</option>
//                   <option value="sandy">Sandy</option>
//                   <option value="silt">Silt</option>
//                   <option value="peat">Peat</option>
//                   <option value="chalk">Chalk</option>
//                   <option value="saline">Saline</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
//                 <input
//                   type="text"
//                   name="region"
//                   value={formData.region}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                   placeholder="Enter region"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Field Status</label>
//                 <select
//                   name="fieldStatus"
//                   value={formData.fieldStatus}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                   <option value="maintenance">Maintenance</option>
//                 </select>
//               </div>
//               <div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Latitude</label>
//                     <input
//                       type="number"
//                       step="any"
//                       name="latitude"
//                       value={formData.latitude}
//                       onChange={handleChange}
//                       className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                       placeholder="Enter latitude"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Longitude</label>
//                     <input
//                       type="number"
//                       step="any"
//                       name="longitude"
//                       value={formData.longitude}
//                       onChange={handleChange}
//                       className="w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50"
//                       placeholder="Enter longitude"
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 mt-5">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Field ID</label>
//                     <input
//                       type="text"
//                       name="fieldId"
//                       value={formData.fieldId}
//                       onChange={handleChange}
//                       disabled={!isAdmin}
//                       className={`w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50 ${
//                         !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
//                       }`}
//                       placeholder="Enter field ID"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Farmer ID</label>
//                     <input
//                       type="text"
//                       name="farmerId"
//                       value={formData.farmerId}
//                       onChange={handleChange}
//                       disabled={!isAdmin}
//                       className={`w-full p-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 transition-all duration-200 bg-gray-50 ${
//                         !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
//                       }`}
//                       placeholder="Enter farmer ID"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex gap-4 mt-8">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors duration-300 font-medium"
//                   disabled={isLoading || isSuccess}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 py-3 px-4 bg-green-800 text-white rounded-full hover:bg-green-700 transition-colors duration-300 font-medium disabled:bg-green-600 disabled:cursor-not-allowed"
//                   disabled={isLoading || isSuccess}
//                 >
//                   {isLoading ? 'Updating...' : isSuccess ? 'Saved' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UpdateFieldModalComponent;