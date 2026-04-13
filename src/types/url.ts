export interface CreateUrl {
  originalUrl: string;
  expires: Date | null;
  userId: number;
}

export interface DeleteUrl {
  userId: number;
  urlId: number;
}
