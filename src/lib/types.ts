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
  /** Composition at this field's coordinates, from ISRIC SoilGrids. Absent
   * where the grid has no coverage, not zeroed. */
  soilProfile?: {
    clay: number;
    silt: number;
    sand: number;
    ph: number;
    organicCarbon: number;
    fetchedAt: string;
  } | null;
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
  messageType: "text" | "image" | "video" | "snapshot";
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
  creatorId: {
    _id: string;
    fullName: string;
    photo?: string;
    role: UserRole;
    // Profiles are addressed by userCode, not by _id.
    userCode?: string;
  };
  creatorRole: UserRole;
  postText: string;
  postImage?: string;
  postTopics: string[];
  region?: string;
  reactions: { likes: string[]; dislikes: string[] };
  comments: Array<{
    _id: string;
    commenterId: {
      _id: string;
      fullName: string;
      photo?: string;
      role: UserRole;
      userCode?: string;
    };
    commenterRole: UserRole;
    commentText: string;
    createdAt: string;
  }>;
  isResolved: boolean;
  /** undefined while in review, true published, false held back. */
  isPassedByAI?: boolean;
  reviewNote?: string;
  fieldSnapshot?: FieldSnapshot;
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

/** One point in an admin progression chart. */
export type MonthlyCount = { month: string; count: number; cumulative: number };

export type AdminOverview = {
  farmers: {
    total: number;
    active: number;
    fieldIntegrated: number;
    monthly: MonthlyCount[];
  };
  experts: {
    total: number;
    active: number;
    designated: number;
    pendingDesignations: number;
    approvedDesignations: number;
    rejectedDesignations: number;
    monthly: MonthlyCount[];
  };
  fields: { total: number; active: number };
  advisories: {
    total: number;
    active: number;
    aiHandled: number;
    expertNeeded: number;
  };
  forum: {
    posts: number;
    contributors: number;
    comments: number;
    impressions: number;
  };
};

/** A field captured at one instant, attached to a conversation or a post. */
export type FieldSnapshot = {
  capturedAt: string;
  field: {
    fieldId: string;
    fieldName: string;
    fieldCrop: string;
    environmentType: EnvironmentType;
    soilType?: string;
    fieldSizeInAcres?: number;
    region?: string;
    location: { latitude: number; longitude: number };
  };
  reading: {
    ts: string;
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
    lightIntensity?: number;
  } | null;
  soil: Record<string, number | null> | null;
  weather: {
    current: {
      time: string;
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      description: string;
    };
    units: { temperature: string; windSpeed: string; precipitation: string };
    timezone: string;
    daily: Array<{
      date: string;
      temperatureMax: number;
      temperatureMin: number;
      precipitationSum: number;
      precipitationProbabilityMax: number;
      description: string;
    }>;
  } | null;
};

/** One page of the forum feed. */
export type PostPage = {
  posts: Post[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type PublicProfile = {
  person: {
    userCode: string;
    fullName: string;
    role: UserRole;
    photo?: string;
    address?: string;
    expertStatus?: "pending" | "verified" | "rejected";
    designations?: Array<{
      designationTitle: string;
      designatedFrom: string;
      isApproved?: boolean;
    }>;
    joinedAt?: string;
  };
  isSelf: boolean;
  follow: { followers: number; following: number; isFollowing: boolean };
  posts: Post[];
};

export type FarmerFieldSummary = {
  fieldId: string;
  fieldName: string;
  environmentType: EnvironmentType;
  isReporting: boolean;
  ts: string | null;
  temperature: number | null;
  humidity: number | null;
  soilMoisture: number | null;
  lightIntensity: number | null;
};

export type FarmerOverview = {
  fields: { total: number; active: number; reporting: number };
  advisories: { total: number; active: number; resolved: number };
  community: { posts: number; comments: number; followers: number; following: number };
  latestByField: FarmerFieldSummary[];
  trend: SeriesBucket[];
};

export type ExpertOverview = {
  advisories: {
    requested: number;
    resolved: number;
    active: number;
    farmersHelped: number;
  };
  community: { posts: number; comments: number; followers: number };
  reviews: { count: number; averageStars: number | null };
  designations: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
};
