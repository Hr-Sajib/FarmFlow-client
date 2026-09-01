export type UserRole = "admin" | "farmer" | "expert";

export type User = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  photo?: string;
  role: UserRole;
  status: "active" | "blocked";
  userCode: string;
  expertStatus?: "pending" | "verified" | "rejected";
  designations?: Designation[];
  createdAt: string;
};

export type Designation = {
  _id: string;
  designationTitle: string;
  designatedFrom: string;
  documents: string[];
  isApproved: boolean;
};

export type EnvironmentType = "open_field" | "greenhouse" | "net_house";

export type Field = {
  _id: string;
  fieldId: string;
  fieldName: string;
  fieldImage: string;
  fieldCrop: string;
  fieldLocation: { latitude: number; longitude: number };
  fieldSizeInAcres?: number;
  soilType?: string;
  environmentType: EnvironmentType;
  farmerId: string;
  region?: string;
  fieldStatus?: "active" | "inactive" | "maintenance";
  deviceId?: string;
  isMotorOn: boolean;
  isShadeOn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Reading = {
  ts: string;
  meta: { farmerId: string; fieldId: string; deviceId?: string };
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  lightIntensity?: number;
};

export type SeriesBucket = {
  ts: string;
  temperature: number | null;
  humidity: number | null;
  soilMoisture: number | null;
  lightIntensity: number | null;
  samples: number;
};

export type Weather = {
  fieldId: string;
  fieldName: string;
  timezone: string;
  elevation: number;
  units: { temperature: string; windSpeed: string; precipitation: string };
  current: {
    time: string;
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
    description: string;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    humidity: number;
    precipitationProbability: number;
    description: string;
  }>;
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitationSum: number;
    precipitationProbabilityMax: number;
    description: string;
  }>;
};

export type AdvisoryStatus =
  | "ai_active"
  | "awaiting_expert"
  | "expert_active"
  | "resolved"
  | "closed";

export type AdvisoryMessage = {
  senderRole: "farmer" | "expert" | "ai";
  senderId?: string;
  messageType: "text" | "image" | "video";
  messageContent: string;
  sentAt: string;
};

export type AdvisorySession = {
  _id: string;
  farmerId: string;
  fieldId?: string;
  problemStatement: string;
  problemDetails?: string;
  attachedMediaUrls: string[];
  status: AdvisoryStatus;
  expertId?: string;
  chatHistory: AdvisoryMessage[];
  feedbackText?: string;
  feedbackStarCount?: number;
  createdAt: string;
};

export type Post = {
  _id: string;
  creatorId: { _id: string; fullName: string; photo?: string; role: UserRole };
  creatorRole: UserRole;
  postText: string;
  postImage?: string;
  postTopics: string[];
  region?: string;
  reactions: { likes: string[]; dislikes: string[] };
  comments: Array<{
    _id: string;
    commenterId: { _id: string; fullName: string; photo?: string; role: UserRole };
    commenterRole: UserRole;
    commentText: string;
    createdAt: string;
  }>;
  isResolved: boolean;
  createdAt: string;
};

/** Anonymised reading shown to visitors who have no account. */
export interface PublicReading {
  label: string;
  ts: string;
  temperature: number | null;
  humidity: number | null;
  soilMoisture: number | null;
  lightIntensity: number | null;
}

export interface PublicStats {
  fieldsMonitored: number;
  readingsLast24h: number;
  advisorySessionsResolved: number;
  verifiedExperts: number;
}
