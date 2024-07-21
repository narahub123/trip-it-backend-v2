import jwt from "jsonwebtoken";
import { UserType } from "../types/users";

// access 토큰 생성
export const makeAccessToken = (validUser: UserType, expiresIn: string) => {
  const accessToken = jwt.sign(
    {
      userId: validUser.userId,
      email: validUser.email,
      role: validUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );

  return accessToken;
};

// refresh 토큰 생성
export const makeRefreshToken = (validUser: UserType, expiresIn: string) => {
  const refreshToken = jwt.sign(
    {
      userId: validUser.userId,
      email: validUser.email,
      role: validUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );

  return refreshToken;
};
