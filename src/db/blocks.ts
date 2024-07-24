import mongoose, { Schema } from "mongoose";

// BlockSchema 정의: 차단 정보를 저장하기 위한 스키마
const BlockSchema = new mongoose.Schema(
  {
    // 차단 아이디
    blockId: {
      type: Schema.Types.ObjectId, // MongoDB의 ObjectId 타입으로 차단 아이디를 저장
      required: true, // 필수 필드로 지정, 값을 반드시 입력해야 함
    },
    // 차단한 유저의 아이디
    userId: {
      type: Schema.Types.ObjectId, // MongoDB의 ObjectId 타입으로 차단한 유저의 아이디를 저장
      required: true, // 필수 필드로 지정, 값을 반드시 입력해야 함
    },
    // 차단당한 유저의 아이디
    blockedId: {
      type: Schema.Types.ObjectId, // MongoDB의 ObjectId 타입으로 차단당한 유저의 아이디를 저장
      required: true, // 필수 필드로 지정, 값을 반드시 입력해야 함
    },
    // 차단 날짜
    blockDate: {
      type: Date, // 날짜 타입으로 차단 날짜를 저장
      default: Date.now, // 기본값을 현재 날짜로 설정
      get: (date: Date) => date.toISOString().slice(0, 10), // 저장된 날짜를 YYYY-MM-DD 형식으로 변환하여 반환
      set: (dateString: string) => new Date(dateString), // 문자열 형식의 날짜를 Date 객체로 변환하여 저장
    },
  },
  {
    versionKey: false, // Mongoose의 __v 필드를 제거하여 버전 관리를 비활성화
  }
);

// 인덱스 설정: userId와 blockedId의 조합이 유일하도록 설정
// 동일한 userId와 blockedId 조합의 문서는 중복 저장이 불가능(같은 유저 두 번 차단 안됨)
BlockSchema.index({ userId: 1, blockedId: 1 }, { unique: true });

// Block 모델을 생성하여 내보냄
// BlockSchema를 기반으로 Block 모델을 생성하여 MongoDB와 상호작용
export const Block = mongoose.model("Block", BlockSchema);
