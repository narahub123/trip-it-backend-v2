import mongoose, { Schema } from "mongoose";

// 정규 표현식 패턴: HH:mm 형식 (24시간제)
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

// 날짜를 'YYYYMMDD HH:mm:ss' 형식으로 변환하는 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear(); // 연도
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월 (0부터 시작하므로 +1)
  const day = String(date.getDate()).padStart(2, "0"); // 일
  const hours = String(date.getHours()).padStart(2, "0"); // 시
  const minutes = String(date.getMinutes()).padStart(2, "0"); // 분
  const seconds = String(date.getSeconds()).padStart(2, "0"); // 초

  return `${year}${month}${day} ${hours}:${minutes}:${seconds}`; // 'YYYYMMDD HH:mm:ss' 형식으로 변환
};

// 스케줄 상세 스키마 정의
const ScheduleDetailSchema = new mongoose.Schema(
  {
    scheduleDetailId: {
      type: Schema.Types.ObjectId, // 스케줄 상세 ID (MongoDB ObjectId 형식)
      required: true, // 필수 입력 필드
    },
    scheduleId: {
      type: Schema.Types.ObjectId, // 스케줄 ID (MongoDB ObjectId 형식)
      required: true, // 필수 입력 필드
    },
    scheduleOrder: {
      type: Number, // 스케줄 순서 (숫자 형식)
      required: true, // 필수 입력 필드
      match: /^[0-9]$/, // 정규 표현식 패턴: 0부터 9까지의 숫자
    },
    startTime: {
      type: String, // 시작 시간 (문자열 형식)
      default: "06:00", // 기본값을 "06:00"으로 설정
      match: [
        timePattern, // 정규 표현식으로 시간 형식 검증
        "시간 형식이 올바르지 않습니다. HH:mm 형식이어야 합니다.", // 검증 실패 시 에러 메시지
      ],
    },
    endTime: {
      type: String, // 종료 시간 (문자열 형식)
      default: "07:00", // 기본값을 "07:00"으로 설정
      match: [
        timePattern, // 정규 표현식으로 시간 형식 검증
        "시간 형식이 올바르지 않습니다. HH:mm 형식이어야 합니다.", // 검증 실패 시 에러 메시지
      ],
    },
    contentId: {
      type: String, // 내용 ID (문자열 형식)
      required: true, // 필수 입력 필드
    },
    registerTime: {
      type: Date, // 등록 시간 (날짜 형식)
      default: Date.now, // 기본값을 현재 날짜로 설정
      get: (date: Date) => formatDate(date), // getter를 사용하여 'YYYYMMDD HH:mm:ss' 형식으로 변환하여 반환
      set: (dateString: string) => new Date(dateString), // 문자열 형식의 날짜를 Date 객체로 변환하여 저장
    },
  },
  {
    versionKey: false, // __v 필드 버전 관리 비활성화
    toJSON: { getters: true }, // JSON으로 변환 시 getter를 포함하도록 설정
  }
);

// 스케줄 상세 모델 정의 및 내보내기
export const ScheduleDetail = mongoose.model(
  "ScheduleDetail", // 모델 이름
  ScheduleDetailSchema // 스키마
);
