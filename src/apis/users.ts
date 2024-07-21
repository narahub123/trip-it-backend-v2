import mongoose from "mongoose";
import { User } from "../db/users";
import { UserInputType } from "types/users";

// 회원 가입
export const createUser = async (userData: UserInputType) => {
  try {
    // 새로운 ObjectId를 생성하여 userId에 할당
    const userId = new mongoose.Types.ObjectId();

    // 사용자 정보와 생성된 userId를 포함하여 User 모델 인스턴스 생성
    const user = new User({
      ...userData,
      userId,
      _id: userId, // _id 필드에 userId를 설정
    });

    // 사용자 정보를 데이터베이스에 저장하고 결과를 반환
    return await user.save();
  } catch (error) {
    // 오류 발생 시 콘솔에 오류를 출력
    console.log("회원 생성 에러", error);
    throw new Error("회원 생성 실패");
  }
};

// 이메일을 이용해 회원 확인
export const getUserByEmail = (email: string) => {
  try {
    // 이메일로 사용자 정보를 조회하여 반환
    return User.findOne({ email });
  } catch (error) {
    console.log("이메일로 회원 조회 실패", error);
    throw new Error("이메일로 회원 조회 실패");
  }
};

// 닉네임을 이용해 회원 확인
export const getUserByNickname = (nickname: string) => {
  try {
    // 닉네임으로 사용자 정보를 조회하여 반환
    return User.findOne({ nickname });
  } catch (error) {
    console.log("닉네임으로 회원 조회 실패", error);
    throw new Error("닉네임으로 회원 조회 실패");
  }
};
