import express from "express";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "../apis/users";
import { makeAccessToken } from "../utils/auth";

export const verifyToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const excludedPaths = ["/login", "/join"]; // 제외할 경로들

  if (excludedPaths.includes(req.path)) {
    // login 또는 join 경로일 경우 미들웨어를 건너뜁니다.
    return next();
  }

  // 요청 헤더에서 access와 refresh 토큰 추출
  const access = req.header("access");
  const refresh = req.header("refresh");

  // access 또는 refresh 토큰이 없는 경우, 401 상태 코드와 메시지 반환
  if (!access || !refresh) {
    return res.status(401).json({ code: 2, msg: "토큰 만료 재로그인" });
  }

  // access 토큰 검증
  try {
    const decode = jwt.verify(access, process.env.JWT_SECRET) as jwt.JwtPayload;

    // access 토큰이 검증된 경우 사용자 정보를 request header에 넣기
    const { userId, email, role } = decode;

    const user = {
      userId,
      email,
      role,
    };

    req.user = user;

    next();
  } catch (error) {
    console.log(error);

    // refresh 토큰이 유효하지 않거나 검증에 실패한 경우, 401 상태 코드와 메시지 반환
    return res.status(401).json({ code: 2, msg: "토큰 만료 재로그인" });
  }
};
