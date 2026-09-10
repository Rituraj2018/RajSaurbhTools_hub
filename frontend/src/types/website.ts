export interface Website {
  id: string;
  _id?: string;
  name: string;
  url: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdBy?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteFormData {
  name: string;
  url: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export interface WebsitesApiResponse {
  success: boolean;
  message: string;
  data: {
    websites: Website[];
    total: number;
  };
}

export interface SingleWebsiteApiResponse {
  success: boolean;
  message: string;
  data: {
    website: Website;
  };
}
