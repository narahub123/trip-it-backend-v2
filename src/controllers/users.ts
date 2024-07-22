import { getUserByEmail, patchPassword } from "../apis/users";
import express from "express";
import bcryptjs from "bcryptjs";

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

    // 보안을 위해서 password는 빈문자열을 보냄
    const modifiedUser = {
      ...user,
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
      return res.status(401).json({ code: 6, msg: "현재와 동일한 패스워드" });
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