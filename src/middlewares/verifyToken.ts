import express from "express";
import jwt from "jsonwebtoken";

export const verifyToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const excludedPaths = [
    "/login",
    "/join",
    /^\/home(\/.*)?$/, // /home 경로와 하위 경로들을 포함합니다.
    "/community/communityList",
    "/community/communityListByView",
    "/community/communitySearch",
    /^\/community\/communityDetailGuest\/[^/]+\/[^/]+$/,
  ];

  const pathsToInclude = [
    "/home/saveSchedule", // 제외할 경로에서 다시 포함시킬 경로
  ];

  const shouldExclude = excludedPaths.some((path) => {
    if (path instanceof RegExp) {
      return path.test(req.path); // 정규식으로 경로 매칭
    }
    return path === req.path; // 단순 문자열 비교
  });

  // 포함 경로를 다시 체크하여 제외 여부를 판단합니다.
  const shouldInclude = pathsToInclude.includes(req.path);

  if (shouldExclude && !shouldInclude) {
    // 제외할 경로이면서, 포함 경로 목록에 없는 경우
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
