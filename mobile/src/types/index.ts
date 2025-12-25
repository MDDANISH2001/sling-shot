export interface UserData {
  name: string;
  message: string;
  selfie: string;
}

export interface ShotPayload extends UserData {
  force: number;
  timestamp: number;
}
