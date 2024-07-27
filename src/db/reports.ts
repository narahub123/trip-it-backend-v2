import mongoose, { Schema } from "mongoose";

// 신고 정보를 저장하기 위한 스키마를 정의
const ReportSchema = new mongoose.Schema(
  {
    // 신고 아이디
    reportId: {
      type: Schema.Types.ObjectId,
      required: true, // 필수 필드로 설정
    },
    // 모집글 아이디
    postId: {
      type: Schema.Types.ObjectId,
      required: true, // 필수 필드로 설정
    },
    // 유저 아이디
    userId: {
      type: Schema.Types.ObjectId,
      required: true, // 필수 필드로 설정
    },
    // 신고 유형
    reportType: {
      type: String,
      enum: ["R1", "R2", "R3", "R4"], // 허용된 신고 유형을 지정
      required: true, // 필수 필드로 설정
    },
    // 신고 상세
    reportDetail: {
      type: String,
      default: "", // 기본값을 빈 문자열로 설정
    },
    // 신고 날짜
    reportDate: {
      type: Date, // 날짜 타입으로 설정
      default: Date.now, // 기본값을 현재 날짜로 설정
      get: (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, ""), // 저장된 날짜를 YYYYMMDD 형식으로 변환하여 반환
      set: (dateString: string) => new Date(dateString), // 문자열 형식의 날짜를 Date 객체로 변환하여 저장
    },
    // 신고 허위 여부
    reportFalse: {
      type: Number,
      default: 0, // 기본값을 0으로 설정
    },
  },
  {
    versionKey: false, // Mongoose의 __v 필드를 제거하여 버전 관리를 비활성화
    toJSON: { getters: true }, // JSON으로 변환 시 getter를 포함하도록 설정
  }
);

// 인덱스 설정: userId와 postId의 조합이 유일하도록 설정
// 동일한 userId와 postId 조합의 문서는 중복 저장이 불가능 (같은 유저가 동일한 게시글을 두 번 신고할 수 없음)
ReportSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Report 모델을 생성하여 내보냄
// ReportSchema를 기반으로 Report 모델을 생성하여 MongoDB와 상호작용
export const Report = mongoose.model("Report", ReportSchema);
