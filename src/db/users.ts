import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // 유저 아이디
    userId: {
      type: Schema.Types.ObjectId, // _id 값을 userId에 저장
      required: true,
    },
    // 이메일
    email: {
      type: String,
      required: [true, "이메일 형식에 맞는 주소를 입력해주세요"],
      trim: true,
      unique: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i,
    },
    // 유저 이름
    username: {
      type: String,
      required: [true, "이름은 한글로 2-5자 내외로 작성해주세요"],
      trim: true,
      match: /^[가-힣]{2,5}$/,
    },
    // 유저 닉네임
    nickname: {
      type: String,
      required: [
        true,
        "닉네임은 한글, 영어, 숫자 조합으로 2-20자 내외로 작성해주세요",
      ],
      trim: true,
      unique: true,
      match: /^[a-zA-Z가-힣0-9_]{2,20}$/,
    },
    // 비밀번호
    password: {
      type: String,
      required: true,
      trim: true,
    },
    // 생년월일
    birth: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{8}$/,
    },
    // 성별
    gender: {
      type: String,
      required: true,
      enum: ["m", "f"],
    },
    // 등급(?)
    role: {
      type: String,
      default: "ROLE_USER",
    },
    // 가입일
    regdate: {
      type: Date,
      default: Date.now,
      get: (date: Date) => date.toISOString().slice(0, 10), // YYYY-MM-DD 형식
      set: (dateString: string) => new Date(dateString), // 문자열을 Date 객체로 변환
    },
    // 신고 개수
    reportCount: {
      type: Number,
      default: 0,
    },
    // 프로필 사진
    userpic: {
      type: String,
      trim: true,
      default: "",
    },

    // 자기 소개
    userIntro: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100, // 최대 길이 100
    },

    // 탈퇴일
    endDate: {
      type: Date,
    },
    socialType: {
      type: String,
    },
  },
  {
    versionKey: false,
  }
);

export const User = mongoose.model("User", UserSchema);
