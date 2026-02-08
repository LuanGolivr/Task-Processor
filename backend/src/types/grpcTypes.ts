export interface StatusRequest {
  id: string;
  status: string;
}

export interface StatusResponse {
  sucess: boolean;
  message: string;
}
