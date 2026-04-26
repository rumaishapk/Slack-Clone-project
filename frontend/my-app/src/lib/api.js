import { axiosInstance } from "./axios";

export async function getStreamToken(authToken) {
  const response = await axiosInstance.get("/chat/token", {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return response.data;
}

export async function createChannel(channelPayload, authToken) {
  const response = await axiosInstance.post("/chat/channels", channelPayload, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return response.data;
}

export async function deleteChannel(channelId, authToken) {
  const response = await axiosInstance.delete(
    `/chat/channels/${encodeURIComponent(channelId)}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  return response.data;
}
