import {
  createUser,
  getUserByEmail,
  getUserByNickname,
  getUserByRefreshToken,
  updateRefreshToken,
} from "../apis/users";
import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { makeAccessToken, makeRefreshToken } from "../utils/auth";

// 토큰 확인 함수
export const checkToken = async (
  req: express.Request,
  res: express.Response
) => {
  const access = req.header("access");

  if (!access) {
    return res.status(401).json({ code: 2, msg: "토큰 없음" });
  }

  try {
    // 만료 여부 확인
    const decode = jwt.verify(access, process.env.JWT_SECRET) as jwt.JwtPayload;

    console.log("access 확인");

    return res.status(200).json({ code: "ok", msg: "토큰 확인 완료" });
  } catch (error) {
    console.log("토큰 에러", error);

    return res.status(401).json({ code: 2, msg: "토큰 만료 재로그인" });
  }
};

// 토큰 재발급 함수
export const reissue = async (req: express.Request, res: express.Response) => {
  // 요청 헤더에서 access와 refresh 토큰 추출
  const access = req.header("access");
  const refresh = req.header("refresh");

  // access 또는 refresh 토큰이 없는 경우, 401 상태 코드와 메시지 반환
  if (!access || !refresh) {
    return res.status(401).json({ code: 2, msg: "토큰 만료 재로그인" });
  }

  // access 토큰 검증
  try {
    // 액세스 토큰을 검증하고, 검증된 토큰에서 사용자 정보를 추출합니다.
    const decode = jwt.verify(access, process.env.JWT_SECRET) as jwt.JwtPayload;

    // 액세스 토큰이 유효한 경우, 사용자 정보를 request 객체에 추가합니다.
    const { userId, email, role } = decode;
    const user = {
      userId,
      email,
      role,
    };

    req.user = user;

    // 액세스 토큰이 유효하므로, 현재의 access와 refresh 토큰을 반환합니다.
    return res.status(200).json({ access, refresh });
  } catch (error) {
    console.log(error);

    // 액세스 토큰 검증이 실패한 경우, refresh 토큰을 검증합니다.

    try {
      // 요청한 리프레시 토큰을 기반으로 사용자 정보를 조회합니다.
      const userInfo = await getUserByRefreshToken(refresh);
      console.log(userInfo);

      // 리프레시 토큰에 대한 사용자가 존재하지 않는 경우
      if (!userInfo) {
        return res
          .status(401)
          .json({ code: 6, msg: "리프레시 토큰 검증 실패" });
      }

      // 리프레시 토큰을 검증하여 토큰의 유효성을 확인합니다.
      const decode = jwt.verify(
        refresh,
        process.env.JWT_SECRET
      ) as jwt.JwtPayload;
      const { email, userId, role } = decode;

      const user = { email, userId, role };

      // 이메일로 사용자 정보를 조회하여 유효성을 확인합니다.
      const validUser = await getUserByEmail(email);

      // 유효한 사용자를 찾을 수 없는 경우
      if (!validUser) {
        return res
          .status(404)
          .json({ code: 2, msg: "유효한 유저를 찾을 수 없습니다." });
      }

      // 새로운 액세스 토큰을 생성합니다.
      const accessExpiryDate = "1h"; // 액세스 토큰의 유효 기간 설정
      const newAccessToken = makeAccessToken(validUser, accessExpiryDate);

      // 검증된 유저의 경우, 사용자 정보를 request 객체에 추가합니다.
      req.user = user;

      // 새로운 액세스 토큰과 기존 리프레시 토큰을 반환합니다.
      return res.status(200).json({ access: newAccessToken, refresh });
    } catch (error) {
      console.log(error);
      // 리프레시 토큰 검증에 실패한 경우, 401 상태 코드와 메시지를 반환합니다.
      return res.status(401).json({ code: 2, msg: "토큰 만료 재로그인" });
    }
  }
};

// 로그인
export const login = async (req: express.Request, res: express.Response) => {
  // 요청 바디에서 이메일과 비밀번호 추출
  const { email, password } = req.body;

  try {
    // 이메일로 사용자 정보 조회
    const validUser = await getUserByEmail(email);

    // 유효한 사용자인지 확인
    if (!validUser) {
      // 유저를 찾지 못한 경우, 404 상태 코드와 에러 메시지 반환
      return res
        .status(404)
        .json({ code: 1, msg: "이메일을 사용하는 유저를 찾을 수 없음" });
    } else {
      console.log("해당 이메일을 사용하는 유저를 찾음");
    }

    // 비밀번호 검사
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      // 비밀번호가 일치하지 않는 경우, 401 상태 코드와 에러 메시지 반환
      return res.status(401).json({ code: 2, msg: "잘못된 비밀번호" });
    } else {
      console.log("비밀번호 일치 확인");
    }

    // access token 생성
    const accessExpiryDate = "1h"; // access token 유효 기간 설정
    // access token 생성 함수 호출
    const accessToken = makeAccessToken(validUser, accessExpiryDate);

    // refresh token 생성
    const refreshExpiryDate = "24h"; // refresh token 유효 기간 설정
    // access token 생성 함수 호출
    const refreshToken = makeRefreshToken(validUser, refreshExpiryDate);

    const user = {
      userId: validUser.userId,
      email: validUser.email,
      role: validUser.role,
    };

    req.user = user;

    console.log("라퀘스트", req.user);

    // refresh 토큰을 db에 저장
    const response = await updateRefreshToken(email, refreshToken);

    // 생성된 토큰들을 응답으로 반환
    return res
      .status(200)
      .json({
        access: accessToken,
        refresh: refreshToken,
        role: validUser.role,
      });
  } catch (error) {
    // 에러 발생 시, 콘솔에 에러 로그 출력 후 500 상태 코드와 에러 메시지 반환
    console.log(error);
    return res.status(500).json({ code: 1, msg: "Internal Error" });
  }
};

// 회원 가입
export const join = async (req: express.Request, res: express.Response) => {
  // 클라이언트로부터 요청받은 회원 가입 정보 추출
  const { email, password, username, nickname, gender, birth } = req.body;

  // 모든 필드가 존재하는지 확인
  if (!email || !password || !username || !nickname || !gender || !birth) {
    return res
      .status(400)
      .json({ code: 3, msg: "존재하지 않는 필드가 있습니다." });
  }

  try {
    // 동일 이메일을 가진 사용자가 있는지 확인
    const existingEmailUser = await getUserByEmail(email);

    if (existingEmailUser) {
      console.log("동일 이메일이 존재합니다.");
      return res.status(400).json({
        code: 1,
        msg: "이미 존재하는 이메일입니다.",
      });
    } else {
      console.log("동일 이메일이 존재하지 않습니다.");
    }

    // 동일 닉네임을 가진 사용자가 있는지 확인
    const existingNicknameUser = await getUserByNickname(nickname);

    if (existingNicknameUser) {
      console.log("동일 닉네임이 존재합니다.");
      return res.status(400).json({
        code: 2,
        msg: "이미 존재하는 닉네임입니다.",
      });
    } else {
      console.log("동일 닉네임이 존재하지 않습니다.");
    }

    // 패스워드를 해싱하여 보안 강화
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // 새 유저 정보를 데이터베이스에 저장
    const user = await createUser({
      email,
      password: hashedPassword,
      username,
      nickname,
      gender,
      birth,
    });

    // 성공적으로 생성된 유저 정보를 응답
    return res.status(201).json(user);
  } catch (error) {
    // 오류 발생 시 로그 기록 및 클라이언트에 오류 응답
    console.log(error);
    return res.status(500).json({ code: 4, msg: "서버 오류가 발생했습니다." });
  }
};
