import mongoose from "mongoose";

// user 생성시 input 객체의 타입 정의
export interface UserInputType {
  email: string;
  password: string;
  username: string;
  nickname: string;
  gender: string;
  birth: string;
}
