export interface CreateUrl {
  originalUrl: string;
  expires: Date | null;
  userId: number;
}

export interface DeleteUrl {
  userId: number;
  urlId: number;
}

export interface GetUrl {
  userId: number;
  page?: number;
  limit?: number;
}
