import { getUserByEmail } from "../apis/users";
import express from "express";

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

    // 사용자가 존재하면 200 상태 코드와 함께 사용자 데이터 반환
    return res.status(200).json(user);
  } catch (error) {
    // 오류 발생 시 콘솔에 로그를 남기고 500 상태 코드와 함께 "인터널 에러" 메시지 반환
    console.log("사용자 정보를 찾을 수 없음", error);
    res.status(500).json({ code: 2, msg: "인터널 에러" });
  }
};
