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
};