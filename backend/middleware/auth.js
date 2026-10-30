import jwt from "jsonwebtoken";
export function authenticate(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  try {
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (!/^[a-f0-9]{24}$/i.test(decoded.id)) throw new Error();
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Please sign in again" });
  }
}
