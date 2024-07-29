import mongoose, { Schema } from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    postTitle: {
      type: String,
      required: true,
    },
    postContent: {
      type: String,
      required: true,
    },
    personnel: {
      type: Number,
      required: true,
    },
    postDate: {
      type: Date,
      default: Date.now, // 기본값을 현재 날짜로 설정
      get: (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, ""), // 저장된 날짜를 YYYYMMDD 형식으로 변환하여 반환
      set: (dateString: string) => new Date(dateString), // 문자열 형식의 날짜를 Date 객체로 변환하여 저장
    },
    postPic: {
      type: String,
      default: "",
    },
    recruitStatus: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    exposureStatus: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false, // Mongoose의 __v 필드를 제거하여 버전 관리를 비활성화
    toJSON: { getters: true }, // JSON으로 변환 시 getter를 포함하도록 설정
  }
);

export const Post = mongoose.model("Post", PostSchema);
