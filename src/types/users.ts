import mongoose, { ObjectId } from "mongoose";

// user 생성시 input 객체의 타입 정의
export interface UserInputType {
  email: string; // 이메일 문자열
  username: string; // 사용자 이름 문자열
  nickname: string; // 닉네임 문자열
  password: string; // 비밀번호 해시 문자열
  birth: string; // 생년월일 문자열 (YYYYMMDD 형식)
  gender: "m" | "f"; // 성별 문자열 ('m' 또는 'f')
}

export interface UserType extends UserInputType {
  _id: mongoose.Types.ObjectId; // MongoDB ObjectId 타입
  userId: mongoose.Types.ObjectId; // MongoDB ObjectId 타입
  role: string; // 사용자 역할 문자열
  reportCount: number; // 신고 횟수 숫자
  userpic: string; // 사용자 사진 URL 문자열 (비어 있을 수 있음)
  userIntro: string; // 자기소개 문자열 (비어 있을 수 있음)
  regdate: Date; // 등록 날짜
}
