 
export const protectRoute = (req, res, next) => {
  const auth = req.auth?.();

  if (!auth?.userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized - you must be logged in" });
  }

  next();
};
