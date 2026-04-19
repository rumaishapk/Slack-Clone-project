import { getStreamToken as createStreamToken } from "../config/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const auth = req.auth?.();

    if (!auth?.userId) {
      return res.status(401).json({
        message: "Unauthorized - you must be logged in",
      });
    }

    const token = createStreamToken(auth.userId);

    if (!token) {
      return res.status(500).json({
        message: "Failed to generate Stream token",
      });
    }

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error generating Stream token:", error);
    res.status(500).json({
      message: "Failed to generate Stream token",
    });
  }
};
