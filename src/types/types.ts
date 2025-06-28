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


export type TCurrentUser = {
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


export interface IPost {
    _id?:string;
    creatorName: string;
    creatorPhoto: string;
    creatorId: string;
    postText: string;
    postImage: string;
    reactions: TReaction;
    comments: TComment[];
    postTopics: TPostTopic[];
    createdAt: string;
}

export type TReaction = {
    likes: {
        count: number,
        by: string[] 
    };
    dislikes: {
        count: number,
        by: string[]
    };
}

export type TPostTopic =
  | 'rice'
  | 'potato'
  | 'onion'
  | 'disease'
  | 'insect'
  | 'fertilizer'
  | 'irrigation'
  | 'weather'
  | 'harvest'
  | 'equipment'
  | 'market'
  | 'pest'
  | 'technology';


export type TComment = {
    commenterName: string;
    commenterId: string;
    commentText: string;
}