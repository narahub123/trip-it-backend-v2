import { createUser, getUserByEmail, getUserByNickname } from "../apis/users";
import express from "express";
import bcryptjs from "bcryptjs";

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
