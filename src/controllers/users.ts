import {
  getUserByEmail,
  getUserByNickname,
  getUserByUserId,
  getUsers,
  patchPassword,
  patchProfile,
  patchUserRole,
} from "../apis/users";
import express from "express";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

// 유저 목록
export const fetchUsers = async (
  req: express.Request,
  res: express.Response
) => {
  const { role } = req.user;

  if (role !== "ROLE_ADMIN") {
    return res.status(403).json({ code: 1, msg: "권한 없음" });
  }

  const { sortKey, sortValue, field, search } = req.query;

  // 페이징
  const limit = Number(req.query.size);
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  console.log(sortKey, sortValue, field, search);

  try {
    const result = await getUsers(
      sortKey.toString(),
      sortValue.toString(),
      skip,
      limit,
      field.toString(),
      search.toString()
    );

    const users = result[0];

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 3, msg: "인터널 에러" });
  }
};

// 이메일 통해 사용자 데이터 가져오기
export const fetchUserData = async (
  req: express.Request,
  res: express.Response
) => {
  // req.user 객체에서 이메일 추출
  const { email } = req.user;

  try {
    // 이메일을 통해 사용자 정보를 조회
    const user = await getUserByEmail(email);

    // 사용자가 존재하지 않으면 401 상태 코드와 함께 "사용자가 없음" 메시지 반환
    if (!user) {
      return res.status(401).json({ code: 1, msg: "사용자가 없음" });
    }

    const { password, ...rest } = user.toObject();

    // 보안을 위해서 password는 빈문자열을 보냄
    const modifiedUser = {
      ...rest,
      password: "",
    };

    // 사용자가 존재하면 200 상태 코드와 함께 사용자 데이터 반환
    return res.status(200).json(modifiedUser);
  } catch (error) {
    // 오류 발생 시 콘솔에 로그를 남기고 500 상태 코드와 함께 "인터널 에러" 메시지 반환
    console.log("사용자 정보를 찾을 수 없음", error);
    res.status(500).json({ code: 2, msg: "인터널 에러" });
  }
};

// 비밀번호 확인하기
export const checkPassword = async (
  req: express.Request,
  res: express.Response
) => {
  // 요청된 이메일과 비밀번호를 추출
  const { email } = req.user; // 사용자 인증 정보를 통해 이메일을 가져옴
  const { password } = req.body; // 요청 본문에서 비밀번호를 가져옴

  // 이메일로 사용자 정보를 조회
  const validUser = await getUserByEmail(email);

  // 입력된 비밀번호와 저장된 비밀번호 비교 (해싱된 비밀번호 사용)
  const validPassword = bcryptjs.compareSync(password, validUser.password);

  if (!validPassword) {
    // 비밀번호가 일치하지 않는 경우, 401 상태 코드와 에러 메시지 반환
    return res.status(401).json({ code: 2, msg: "잘못된 비밀번호" });
  } else {
    // 비밀번호가 일치하는 경우, 200 상태 코드와 성공 메시지 반환
    return res
      .status(200)
      .json({ code: "ok", msg: "비밀번호가 확인되었습니다." });
  }
};

// 비밀번호 업데이트
export const updatePassword = async (
  req: express.Request,
  res: express.Response
) => {
  // 요청된 이메일과 사용자 ID, 비밀번호를 추출
  const { email, userId } = req.user; // 사용자 인증 정보를 통해 이메일과 사용자 ID를 가져옴
  const { password } = req.body; // 요청 본문에서 비밀번호를 가져옴

  // 비밀번호가 제공되지 않은 경우
  if (!password) {
    return res.status(401).json({
      code: 1,
      msg: "입력된 비밀번호가 없습니다.",
    });
  }

  try {
    // 이메일로 사용자 정보를 조회
    const validUser = await getUserByEmail(email);

    if (!validUser) {
      // 사용자가 존재하지 않는 경우
      return res.status(401).json({ code: 2, msg: "사용자가 없음" });
    }

    // 입력된 비밀번호와 저장된 비밀번호 비교 (해싱된 비밀번호 사용)
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (validPassword) {
      // 현재 비밀번호와 동일한 비밀번호를 입력한 경우
      return res.status(422).json({ code: 1, msg: "현재와 동일한 패스워드" });
    }

    // 새로운 비밀번호를 해싱하여 보안 강화
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // 새로운 비밀번호로 업데이트
    const user = await patchPassword(email, hashedPassword);

    if (!user) {
      // 비밀번호 업데이트 실패 시
      return res.status(500).json({ code: 3, msg: "비밀번호 업데이트 실패" });
    }

    // 비밀번호 업데이트 성공 시
    return res.status(200).json({ code: "ok" });
  } catch (error) {
    // 서버 오류 발생 시
    console.log(error);
    return res.status(500).json({ code: 4, msg: "서버 오류" });
  }
};

// 프로필 업데이트
export const updateProfile = async (
  req: express.Request,
  res: express.Response
) => {
  const { email } = req.user;
  let { userpic, nickname, intro } = req.body;

  console.log(intro.length);

  try {
    // 이메일로 사용자 정보를 조회
    const validUser = await getUserByEmail(email);

    if (!validUser) {
      // 사용자가 존재하지 않는 경우
      return res.status(401).json({ code: 2, msg: "사용자가 없음" });
    }

    // 기존 사용자와 동일한 닉네임 존재 여부 확인 코드 추가 필요
    if (nickname !== validUser.nickname) {
      const existingUser = await getUserByNickname(nickname);

      if (existingUser) {
        return res.status(409).json({ code: 1, msg: "중복 닉네임" });
      }
    }

    const value = {
      userpic,
      nickname,
      intro,
    };

    // 새로운 프로필로 업데이트
    const user = await patchProfile(email, value);

    if (!user) {
      return res.status(500).json({ code: 3, msg: "업데이트 에러 발생" });
    }

    // 새로운 프로필 업데이트
    return res.status(200).json({ code: "ok", msg: "업데이트 성공" });
  } catch (error) {
    // 서버 오류 발생 시
    console.log(error);
    return res.status(500).json({ code: 4, msg: "서버 오류" });
  }
};

// 유저 정보 가져오기
export const fetchUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { role } = req.user;
  if (role !== "ROLE_ADMIN") {
    return res.status(403).json({ code: 1, msg: "권한 없음" });
  }
  const { userId } = req.params;

  const userIdObj = new mongoose.Types.ObjectId(userId);

  try {
    const user = await getUserByUserId(userIdObj);

    if (!user) {
      return res.status(401).json({ code: 2, msg: "유저 조회 실패" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "서버 오류" });
  }
};

// 유저 등급 업데이트
export const updateUserRole = async (
  req: express.Request,
  res: express.Response
) => {
  const { role } = req.user;
  if (role !== "ROLE_ADMIN") {
    return res.status(403).json({ code: 1, msg: "권한 없음" });
  }

  const { userId, newRole } = req.body;

  try {
    const response = await patchUserRole(userId, newRole);

    if (!response) {
      return res.status(401).json({ code: 2, msg: "업데이트 실패" });
    }

    return res.status(200).json({ code: "ok", msg: "업데이트 성공" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부에러" });
  }
};
