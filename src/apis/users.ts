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

// 비밀번호 업데이트
export const patchPassword = (email: string, password: string) => {
  try {
    // 사용자 이메일로 찾아서 비밀번호를 업데이트
    // email: 업데이트할 사용자의 이메일
    // password: 새로운 비밀번호 (해싱된 상태여야 함)
    // { new: true }: 업데이트된 문서를 반환
    return User.findOneAndUpdate(
      { email }, // 조건: 주어진 이메일로 사용자 찾기
      { password }, // 업데이트할 내용: 새로운 비밀번호
      { new: true } // 업데이트 후 반환할 문서의 옵션 (업데이트된 문서 반환)
    );
  } catch (error) {
    // 비밀번호 업데이트 중 오류가 발생한 경우
    console.log("비밀번호 업데이트 실패", error);
    throw new Error("비밀번호 변경 실패"); // 오류를 발생시켜 상위 호출 스택으로 전파
  }
};
