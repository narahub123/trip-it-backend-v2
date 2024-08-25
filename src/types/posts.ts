import { Types } from "mongoose";

export interface PostType {
  postId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  userId: Types.ObjectId;
  postTitle: string;
  postContent: string;
  personnel: number;
  postPic?: string;
  recruitStatus: number;
  viewCount: 0;
  exposureStatus: number;
  _id: Types.ObjectId;
}
