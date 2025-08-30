import Image from "next/image";
import { TField } from "@/types/types";

interface FieldInProfileProps {
  field: TField;
}

export default function FieldInProfile({ field }: FieldInProfileProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {field.fieldImage && (
        <Image
          src={field.fieldImage}
          alt={field.fieldName}
          width={300}
          height={192}
          className="h-48 w-full object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800">{field.fieldName}</h3>
        <p className="text-gray-600 mt-1">Region: {field.region}</p>
        <p className="text-gray-600">Size: {field.fieldSizeInAcres} acres</p>
        <p className="text-gray-600">Crop: {field.fieldCrop}</p>
      </div>
    </div>
  );
}