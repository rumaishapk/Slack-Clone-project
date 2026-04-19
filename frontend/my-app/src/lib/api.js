import { axiosInstance } from "./axios";

export async function getStreamToken(authToken) {
  const response = await axiosInstance.get("/chat/token", {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return response.data;
}
