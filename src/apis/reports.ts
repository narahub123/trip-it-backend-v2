import mongoose, { Types } from "mongoose";
import { Report } from "../db/reports";

// 신고 추가하기
export const createReport = async (
  userId: Types.ObjectId,
  postId: Types.ObjectId,
  reportType: string,
  reportDetail: string
) => {
  try {
    const reportId = new mongoose.Types.ObjectId();
    const postid = new mongoose.Types.ObjectId(postId);

    let reportReason;

    if (reportType === "R1") {
      reportReason = "음란";
    } else if (reportType === "R2") {
      reportReason = "폭력";
    } else if (reportType === "R3") {
      reportReason = "욕설";
    } else if (reportType === "R4") {
      reportReason = "기타";
    }

    const report = new Report({
      reportId,
      userId,
      postId: postid,
      reportType,
      reportDetail,
      reportReason,
      _id: reportId,
    });

    return await report.save();
  } catch (error) {
    console.log(error);

    const code = error.code;
    throw new Error(code);
  }
};

// 마이 페이지 신고 목록
export const getReportsByUserId = async (userId: Types.ObjectId) => {
  try {
    const results = await Report.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "currentUser",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "reportedPost",
        },
      },
      {
        $unwind: {
          path: "$reportedPost",
          preserveNullAndEmptyArrays: true, // reportedPost가 없을 때도 진행
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportedPost.userId",
          foreignField: "_id",
          as: "blockedUser",
        },
      },
      {
        $unwind: {
          path: "$blockedUser",
          preserveNullAndEmptyArrays: true, // blockedUser가 없을 때도 진행
        },
      },
      {
        $addFields: {
          currentUser: { $arrayElemAt: ["$currentUser", 0] },
          // reportedPost: { $arrayElemAt: ["$reportedPost", 0] },
          // blockedUser: { $arrayElemAt: ["$blockedUser", 0] },
        },
      },
      {
        $project: {
          reportId: 1,
          blockUserId: "$currentUser._id",
          blockUserNickname: "$currentUser.nickname",
          postId: "$reportedPost._id",
          postTitle: "$reportedPost.postTitle",
          blockedUserId: "$blockedUser._id",
          blockedUserNickname: "$blockedUser.nickname",
          reportType: 1,
          reportDetail: 1,
          reportFalse: 1,
          reportDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$reportDate",
            },
          },
          reportReason: 1,
        },
      },
    ]).exec();

    return results;
  } catch (error) {
    console.error("Error fetching reports:", error);
    // 에러 메시지와 함께 사용자에게 적절한 응답을 반환할 수 있도록 추가 개선
    throw new Error(
      "신고 정보를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요."
    );
  }
};

// 관리자 페이지 신고한 목록 가져오기
export const getReports = async (
  sortKey: string,
  sortValue: string,
  skip: number,
  limit: number,
  field: string,
  search: string
) => {
  try {
    const results = await Report.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "currentUser",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "postId",
          as: "reportedPost",
        },
      },
      {
        $unwind: {
          path: "$reportedPost",
          preserveNullAndEmptyArrays: true, // reportedPost가 없을 때도 진행
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportedPost.userId",
          foreignField: "userId",
          as: "blockedUser",
        },
      },
      {
        $unwind: {
          path: "$blockedUser",
          preserveNullAndEmptyArrays: true, // blockedUser가 없을 때도 진행
        },
      },
      {
        $addFields: {
          currentUser: { $arrayElemAt: ["$currentUser", 0] },
        },
      },
      {
        $project: {
          reportId: 1,
          blockUserId: "$currentUser._id",
          blockUserNickname: "$currentUser.nickname",
          postId: "$reportedPost._id",
          postTitle: "$reportedPost.postTitle",
          blockedUserId: "$blockedUser.userId",
          blockedUserNickname: "$blockedUser.nickname",
          reportType: 1,
          reportDetail: 1,
          reportFalse: 1,
          reportDate: {
            $dateToString: {
              format: "%Y%m%d",
              date: "$reportDate",
            },
          },
          reportReason: 1,
        },
      },
      {
        $match: {
          [field]: { $regex: search, $options: "i" },
        },
      },
      {
        $facet: {
          content: [
            {
              $sort: {
                [sortKey]: sortValue === "desc" ? -1 : 1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
          totalElements: [{ $count: "count" }],
        },
      },
      {
        $addFields: {
          totalElements: {
            $ifNull: [{ $arrayElemAt: ["$totalElements.count", 0] }, 0],
          },
        },
      },
    ]).exec();

    return results; // 결과를 반환
  } catch (error) {
    console.log(error);
    throw error; // 에러를 호출한 곳에 전달
  }
};

// 신고 처리하기 함수
export const updateReportsByReportFalse = (
  reportId: Types.ObjectId, // 신고 ID (ObjectId 타입)
  reportFalse: number // 신고 상태 (숫자 타입)
) => {
  try {
    // 신고 ID에 해당하는 신고를 찾아서 신고 상태를 업데이트합니다.
    const reports = Report.findOneAndUpdate(
      { _id: reportId }, // 신고 ID로 문서를 찾습니다.
      { reportFalse }, // reportFalse 값을 업데이트합니다.
      { new: true } // 업데이트된 문서를 반환하도록 설정합니다.
    );

    return reports; // 업데이트된 신고 문서를 반환합니다.
  } catch (error) {
    console.log(error); // 에러 발생 시 콘솔에 에러를 로그로 남깁니다.
  }
};

// reportId로 차단 찾기
export const getReportByReportId = (reportId: Types.ObjectId) => {
  try {
    return Report.findOne({ reportId });
  } catch (error) {
    console.log(error);
  }
};

// 신고 취소하기
export const deleteReport = (reportId: Types.ObjectId) => {
  try {
    return Report.findOneAndDelete({ reportId });
  } catch (error) {
    console.log(error);
  }
};
