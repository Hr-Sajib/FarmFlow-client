export type TField = {
  _id: string;
  fieldId: string;
  fieldName: string;
  fieldImage: string;
  fieldCrop: string;
  fieldLocation: { latitude: number; longitude: number };
  fieldSizeInAcres: number;
  soilType: string;
  farmerId: string;
  region: string;
  fieldStatus: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  sensorData?: {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightIntensity: number;
  };
};


export type TUser = {
  _id: string;
  name: string;
  farmerId: string;
  email: string;
  phone: string;
  address: string;
  passwordChangedAt: string | null;
  role: string;
  status: string;
  fieldIds: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  photo: string;
  __v: number;
};