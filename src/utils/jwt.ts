import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { JwtUserPayload } from "../types/index.js";

export const generateToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtUserPayload;
};
