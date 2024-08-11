import mongoose, { Types } from "mongoose";
import { Schedule } from "../db/schedules";
import { ScheduleDetail } from "../db/scheduleDetails";
import { ScheduleDetailInputType, ScheduleInputType } from "../types/schedules";

// 일정 수정하기
export const patchSchedule = async (scheduleDto: ScheduleInputType) => {
  const updateField = {
    scheduleTitle: scheduleDto.scheduleTitle,
    startDate: scheduleDto.startDate,
    endDate: scheduleDto.endDate,
  };
  try {
    return Schedule.findOneAndUpdate(
      { scheduleId: scheduleDto.scheduleId },
      { $set: updateField },
      { new: true, runValidators: true } // 새로운 문서를 반환하고, 유효성 검사를 실행합니다.
    );
  } catch (error) {
    throw { error };
  }
};

// 일정 상세 수정하기
export const patchScheduleDetails = async (detail: ScheduleDetailInputType) => {
  try {
    return await ScheduleDetail.findOneAndUpdate(
      {
        scheduleDetailId: detail.scheduleDetailId,
      },
      {
        $set: detail,
      },
      { new: true, runValidators: true } // 새로운 문서를 반환하고, 유효성 검사를 실행합니다.
    );
  } catch (error) {
    throw { error };
  }
};

// scheduleId로 상세일정 가져오기
export const getScheduleDetails = async (scheduleId: Types.ObjectId) => {
  try {
    return await ScheduleDetail.find({ scheduleId });
  } catch (error) {
    throw { error };
  }
};

// 일정 저장하기
export const createSchedule = async (schedule: ScheduleInputType) => {
  try {
    // Schedule 모델을 사용하여 새로운 일정 객체를 생성합니다.
    const newSchedule = new Schedule({
      ...schedule,
    });

    // 생성된 일정 객체를 데이터베이스에 저장하고 결과를 반환합니다.
    return await newSchedule.save();
  } catch (error) {
    // 저장 중 오류가 발생하면 에러 객체를 포함하여 예외를 던집니다.
    throw { error };
  }
};

// 일정 상세 저장하기
export const createScheduleDetail = async (detail: ScheduleDetailInputType) => {
  try {
    // ScheduleDetail 모델을 사용하여 새로운 일정 상세 객체를 생성합니다.
    const scheduleDetail = new ScheduleDetail({
      ...detail,
    });

    // 생성된 일정 상세 객체를 데이터베이스에 저장하고 결과를 반환합니다.
    return await scheduleDetail.save();
  } catch (error) {
    // 저장 중 오류가 발생하면 에러 객체를 포함하여 예외를 던집니다.
    throw { error };
  }
};

/**
 * 특정 사용자 ID로 스케줄을 조회하는 함수
 * @param userId - 조회할 사용자의 ID
 * @returns 사용자의 스케줄 목록
 */
export const getSchedulesByUserId = (userId: Types.ObjectId) => {
  try {
    return Schedule.aggregate([
      // 특정 사용자 ID로 스케줄 문서 필터링
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      // 'users' 컬렉션과 조인하여 'currentUser' 배열에 사용자 정보 추가
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "currentUser",
        },
      },

      // 'currentUser' 배열에서 첫 번째 요소의 'userId'와 'nickname'을 현재 문서에 추가
      {
        $addFields: {
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] },
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] },
          },
        },
      },

      // 'registerDate'를 기준으로 내림차순 정렬
      {
        $sort: {
          registerDate: -1,
        },
      },

      // 포함할 필드를 지정하고 날짜를 'YYYYMMDD' 형식으로 변환
      {
        $project: {
          scheduleId: 1,
          metroId: 1,
          userId: 1,
          scheduleTitle: 1,
          startDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$startDate",
            },
          },
          endDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$endDate",
            },
          },
          registerDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$registerDate",
            },
          },
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error); // 에러 발생 시 콘솔에 에러 로그 출력
  }
};

/**
 * 다양한 조건으로 스케줄을 조회하고 정렬 및 페이지네이션을 적용하는 함수
 * @param sortKey - 정렬할 필드
 * @param sortValue - 정렬 방향 (오름차순 또는 내림차순)
 * @param skip - 페이지네이션을 위해 스킵할 문서 수
 * @param limit - 페이지네이션을 위해 반환할 문서 수
 * @param field - 검색할 필드
 * @param search - 검색어
 * @returns 정렬된 스케줄 목록과 총 문서 수
 */
export const getSchedules = (
  sortKey: string,
  sortValue: string,
  skip: number,
  limit: number,
  field: string,
  search: string
) => {
  try {
    return Schedule.aggregate([
      // 'users' 컬렉션과 조인하여 'currentUser' 배열에 사용자 정보 추가
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "currentUser",
        },
      },

      // 'currentUser' 배열에서 첫 번째 요소의 'userId'와 'nickname'을 현재 문서에 추가
      {
        $addFields: {
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] },
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] },
          },
        },
      },

      // 검색 필드와 검색어로 문서 필터링
      {
        $match: {
          [field]: { $regex: search, $options: "i" },
        },
      },

      // 포함할 필드를 지정하고 날짜를 'YYYYMMDD' 형식으로 변환
      {
        $project: {
          scheduleId: 1,
          metroId: 1,
          userId: 1,
          scheduleTitle: 1,
          startDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$startDate",
            },
          },
          endDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$endDate",
            },
          },
          registerDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$registerDate",
            },
          },
        },
      },

      // 페이지네이션 및 정렬을 위한 단계
      {
        $facet: {
          content: [
            // 동적으로 정렬
            {
              $sort: {
                [sortKey]: sortValue === "desc" ? -1 : 1,
              },
            },
            // 페이지네이션: skip 및 limit 적용
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
          // 전체 문서 수 세기
          totalElements: [{ $count: "count" }],
        },
      },

      // 'totalElements'가 없을 경우 기본값 0 설정
      {
        $addFields: {
          totalElements: {
            $ifNull: [{ $arrayElemAt: ["$totalElements.count", 0] }, 0],
          },
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error); // 에러 발생 시 콘솔에 에러 로그 출력
  }
};

// scheduleId로 일정 찾기
export const getScheduleByScheduleId = async (
  scheduleId: Types.ObjectId,
  userId?: Types.ObjectId
) => {
  try {
    return await Schedule.findOne({ scheduleId, userId });
  } catch (error) {
    throw error;
  }
};

// 일정 삭제하기
export const deleteSchedules = (schedulesIds: Types.ObjectId[]) => {
  try {
    return Schedule.deleteMany({ schedulesId: { $in: schedulesIds } });
  } catch (error) {
    throw error;
  }
};
