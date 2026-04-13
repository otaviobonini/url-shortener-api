export interface CreateUrl {
  originalUrl: String;
  expires: Date | null;
  hashedUrl: String;
  userId: Number;
}
