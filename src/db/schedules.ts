import mongoose, { Schema } from "mongoose";

// 스케줄 스키마 정의
const ScheduleSchema = new mongoose.Schema(
  {
    // 스케줄의 고유 ID
    scheduleId: {
      type: Schema.Types.ObjectId,
      required: true, // 필수 입력 필드
    },
    // 사용자의 고유 ID
    userId: {
      type: mongoose.Types.ObjectId,
      required: true, // 필수 입력 필드
    },
    // 지하철 ID (문자열 형식)
    metroId: {
      type: String,
      required: true, // 필수 입력 필드
    },
    // 시작 날짜 (날짜 객체)
    startDate: {
      type: Date,
      required: true, // 필수 입력 필드
      get: (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, ""), // 저장된 날짜를 YYYYMMDD 형식으로 변환하여 반환
      set: (dateString: string) => {
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const date = dateString.slice(6, 8);

        const formattedDateString = `${year}-${month}-${date}`;
        return new Date(formattedDateString);
      }, // 문자열 형식의 날짜를 Date 객체로 변환하여 저장
    },
    // 종료 날짜 (날짜 객체)
    endDate: {
      type: Date,
      required: true, // 필수 입력 필드
      get: (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, ""), // 저장된 날짜를 YYYYMMDD 형식으로 변환하여 반환
      set: (dateString: string) => {
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const date = dateString.slice(6, 8);

        const formattedDateString = `${year}-${month}-${date}`;
        return new Date(formattedDateString);
      }, // 문자열 형식의 날짜를 Date 객체로 변환하여 저장
    },
    // 등록 날짜 (날짜 객체, 기본값은 현재 날짜)
    registerDate: {
      type: Date,
      default: Date.now, // 기본값을 현재 날짜로 설정
      get: (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, ""), // 저장된 날짜를 YYYYMMDD 형식으로 변환하여 반환
      set: (dateString: string) => new Date(dateString), // 문자열 형식의 날짜를 Date 객체로 변환하여 저장
    },
    // 스케줄 제목 (문자열 형식, 최대 30자)
    scheduleTitle: {
      type: String,
      required: true, // 필수 입력 필드
      maxlength: 30, // 문자열 길이 최대값 설정
    },
  },
  {
    versionKey: false, // __v 필드 버전 관리 비활성화
    toJSON: { getters: true }, // JSON으로 변환 시 getter를 포함하도록 설정
  }
);

// 스케줄 모델 정의 및 내보내기
export const Schedule = mongoose.model("Schedule", ScheduleSchema);
