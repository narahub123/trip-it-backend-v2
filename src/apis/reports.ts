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
    const postid = new mongoose.Types.ObjectId();

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
export const getReportByUserId = (userId: Types.ObjectId) => {
  try {
    return Report.aggregate([
      // 특정 userId와 일치하는 문서를 찾기 위한 단계
      { $match: { userId: userId } },

      // 현재 유저(신고한 유저)의 정보를 불러오기 위한 단계
      {
        $lookup: {
          from: "users", // 참조할 컬렉션 이름 (users 컬렉션)
          localField: "userId", // Report 컬렉션의 필드 (userId)
          foreignField: "_id", // users 컬렉션의 _id 필드와 매칭
          as: "currentUser", // 결과가 저장될 필드 이름
        },
      },

      // 신고된 모집글의 정보를 불러오기 위한 단계
      {
        $lookup: {
          from: "posts", // 참조할 컬렉션 이름 (posts 컬렉션)
          localField: "postId", // Report 컬렉션의 필드 (postId)
          foreignField: "_id", // posts 컬렉션의 _id 필드와 매칭
          as: "reportedPost", // 결과가 저장될 필드 이름
        },
      },

      // 필드를 추가하거나 수정하기 위한 단계
      {
        $addFields: {
          // 현재 유저의 정보 추가
          currentUser: { $arrayElemAt: ["$currentUser", 0] },
          // 신고된 모집글의 정보 추가
          reportedPost: { $arrayElemAt: ["$reportedPost", 0] },
        },
      },

      // 신고한 날짜를 기준으로 내림차순 정렬하기 위한 단계
      {
        $sort: {
          reportDate: -1, // reportDate를 기준으로 내림차순 정렬 (-1)
        },
      },

      // 필요한 필드만 선택하여 결과를 반환하기 위한 단계
      {
        $project: {
          reportId: 1, // 신고 아이디 포함
          userId: "$currentUser._id", // 현재 유저의 ID 포함
          nickname: "$currentUser.nickname", // 닉네임 포함
          postId: "$reportedPost._id", // 신고된 모집글의 ID 포함
          postTitle: "$reportedPost.postTitle", // 모집글 이름 포함
          reportType: 1, // 신고 유형
          reportDetail: 1, // 신고 상세 포함
          reportFalse: 1, // 신고 허위 여부 포함
          reportDate: {
            $dateToString: {
              format: "%Y%m%d", // 날짜 형식을 YYYYMMDD로 지정
              date: "$reportDate", // Report 문서의 reportDate 필드 값
            },
          }, // 신고 날짜 포함 (YYYYMMDD 형식으로 변환)
          reportReason: 1, // 신고 이유 포함
        },
      },
    ]).exec();
  } catch (error) {
    console.error("Error fetching reports:", error); // 에러가 발생하면 콘솔에 출력
    throw error; // 에러를 던져서 상위 레벨에서 처리할 수 있도록 함
  }
};

// 관리자 페이지 신고한 목록 가져오기
export const getReports = (
  sortKey: string,
  sortValue: string,
  skip: number,
  limit: number,
  field: string,
  search: string
) => {
  try {
    return Report.aggregate([
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
        $unwind: "$reportedPost", // 배열 평탄화
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
        $unwind: "$blockedUser", // 배열 평탄화
      },

      {
        $addFields: {
          currentUser: { $arrayElemAt: ["$currentUser", 0] },
          // reportedPost: { $arrayElemAt: ["$reportedPost", 0] },
          // blockedUser: { $arrayElemAt: ["$blockedUser", 0] },
        },
      },

      // 필요한 필드만 선택하여 결과를 반환하기 위한 단계
      {
        $project: {
          reportId: 1, // 신고 아이디 포함
          blockUserId: "$currentUser._id", // 현재 유저의 ID 포함
          blockUserNickname: "$currentUser.nickname", // 닉네임 포함
          postId: "$reportedPost._id", // 신고된 모집글의 ID 포함
          postTitle: "$reportedPost.postTitle", // 모집글 이름 포함
          blockedUserId: "$blockedUser.userId",
          blockedUserNickname: "$blockedUser.nickname",
          reportType: 1, // 신고 유형 포함
          reportDetail: 1, // 신고 상세 포함
          reportFalse: 1, // 신고 허위 여부 포함
          reportDate: {
            $dateToString: {
              format: "%Y%m%d", // 날짜 형식을 YYYYMMDD로 지정
              date: "$reportDate", // Report 문서의 reportDate 필드 값
            },
          }, // 신고 날짜 포함 (YYYYMMDD 형식으로 변환)
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
            // sortKey와 sortValue를 사용하여 동적으로 정렬하기 위한 단계
            {
              $sort: {
                [sortKey]: sortValue === "desc" ? -1 : 1, // sortValue가 "desc"이면 내림차순(-1), 그렇지 않으면 오름차순(1)으로 정렬
              },
            },
            {
              $skip: skip, // 페이징을 위해 결과를 skip만큼 건너뜀
            },
            {
              $limit: limit, // 페이징을 위해 결과를 limit만큼 제한함
            },
          ],
          totalElements: [{ $count: "count" }], // 전체 요소 수를 세어 totalElements 필드에 "count"라는 이름으로 저장
        },
      },

      // totalElements 배열을 평평하게 만들기 위한 단계
      {
        $addFields: {
          totalElements: {
            $ifNull: [{ $arrayElemAt: ["$totalElements.count", 0] }, 0], // // totalElements가 없는 경우 기본값 0 추가
          },
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error); // 에러가 발생하면 콘솔에 출력
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
