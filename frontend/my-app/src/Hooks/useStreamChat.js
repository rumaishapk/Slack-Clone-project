import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getStreamToken } from "../lib/api";
import * as Sentry from "@sentry/react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const CONNECT_TIMEOUT_MS = 15000;

const withTimeout = (promise, label, timeoutMs = CONNECT_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs / 1000}s`));
      }, timeoutMs);

      promise.finally(() => clearTimeout(timeoutId));
    }),
  ]);

export const useStreamChat = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [chatClient, setChatClient] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) {
      setStatus("loading-auth");
      return;
    }

    if (!isSignedIn || !user?.id) {
      setStatus("idle");
      setChatClient(null);
      setError(null);
      return;
    }

    if (!STREAM_API_KEY) {
      setStatus("error");
      setChatClient(null);
      setError(new Error("Missing VITE_STREAM_API_KEY in the frontend environment."));
      return;
    }

    let cancelled = false;
    const client = StreamChat.getInstance(STREAM_API_KEY);

    const connectToStream = async () => {
      try {
        setStatus("connecting");
        setError(null);

        const authToken = await withTimeout(getToken(), "Clerk auth token");

        if (!authToken) {
          throw new Error("Failed to get auth token from Clerk.");
        }

        const tokenData = await withTimeout(
          getStreamToken(authToken),
          "Stream token request",
        );

        if (!tokenData?.token) {
          throw new Error("Backend did not return a Stream token.");
        }

        await client.connectUser(
          {
            id: user.id,
            name:
              user.fullName ??
              user.username ??
              user.primaryEmailAddress?.emailAddress ??
              user.id,
            image: user.imageUrl ?? undefined,
          },
          await withTimeout(
            Promise.resolve(tokenData.token),
            "Stream token processing",
          ),
        );

        if (!cancelled) {
          setChatClient(client);
          setStatus("connected");
        }
      } catch (error) {
        if (!cancelled) {
          setChatClient(null);
          setStatus("error");
          setError(error);
        }
        console.log("Error connecting to stream", error);
        Sentry.captureException(error, {
          tags: { component: "useStreamChat" },
          extra: {
            context: "stream_chat_connection",
            userId: user?.id,
            streamApiKey: STREAM_API_KEY ? "present" : "missing",
          },
        });
      }
    };

    connectToStream();

    return () => {
      cancelled = true;
      setChatClient(null);
      client.disconnectUser().catch(() => {});
    };
  }, [
    getToken,
    isAuthLoaded,
    isSignedIn,
    isUserLoaded,
    user?.id,
    user?.fullName,
    user?.username,
    user?.primaryEmailAddress?.emailAddress,
    user?.imageUrl,
  ]);

  return {
    chatClient,
    isLoading: status === "loading-auth" || status === "connecting",
    error,
  };
};
