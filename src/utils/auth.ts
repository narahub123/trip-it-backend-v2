import jwt from "jsonwebtoken";
import { UserType } from "../types/users";

// access 토큰 생성
export const makeAccessToken = (validUser: UserType, expiresIn: string) => {
  // JWT access 토큰 생성
  const accessToken = jwt.sign(
    {
      userId: validUser.userId,
      email: validUser.email,
      role: validUser.role,
    },
    process.env.JWT_SECRET, // 비밀 키를 사용하여 토큰 서명
    {
      expiresIn, // 토큰 만료 시간 설정
    }
  );

  // 생성된 access 토큰 반환
  return accessToken;
};

// refresh 토큰 생성
export const makeRefreshToken = (validUser: UserType, expiresIn: string) => {
  // JWT refresh 토큰 생성
  const refreshToken = jwt.sign(
    {
      userId: validUser.userId,
      email: validUser.email,
      role: validUser.role,
    },
    process.env.JWT_SECRET, // 비밀 키를 사용하여 토큰 서명
    {
      expiresIn, // 토큰 만료 시간 설정
    }
  );

  // 생성된 refresh 토큰 반환
  return refreshToken;
};
