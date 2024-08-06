import { Types } from "mongoose";

export interface ScheduleInputType {
  scheduleId: Types.ObjectId;
  metroId: string;
  startDate: string;
  endDate: string;
  scheduleTitle: string;
  userId: Types.ObjectId;
  _id: Types.ObjectId;
}

export interface ScheduleDetailInputType {
  scheduleDetailId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  contentId: string;
  scheduleOrder: number;
  startTime: string;
  endTime: string;
}
