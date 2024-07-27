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

    const report = new Report({
      reportId,
      userId,
      postId: postid,
      reportType,
      reportDetail,
      _id: reportId,
    });

    return await report.save();
  } catch (error) {
    console.log(error);

    const code = error.code;
    throw new Error(code);
  }
};

// 사용자 신고한 목록 가져오기
export const getReportByUserId = (userId: Types.ObjectId) => {
  try {
    return Report.aggregate([
      // 특정 userId와 일치하는 문서를 찾기 위한 단계
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      // 현재 유저(신고한 유저)의 정보를 불러오기 위한 단계
      {
        $lookup: {
          from: "users", // 참조할 컬렉션 이름 (users 컬렉션)
          localField: "userId", // Report 컬렉션의 필드 (userId)
          foreignField: "userId", // users 컬렉션의 필드 (userId)
          as: "currentUser", // 결과가 저장될 필드 이름
        },
      },

      // 신고된 모집글의 정보를 불러오기 위한 단계
      //   {
      //     $lookup: {
      //       from: "posts", // 참조할 컬렉션 이름 (posts 컬렉션)
      //       localField: "postId", // Report 컬렉션의 필드 (postId)
      //       foreignField: "postId", // posts 컬렉션의 필드 (postId)
      //       as: "reportedPost", // 결과가 저장될 필드 이름
      //     },
      //   },

      // 필드를 추가하거나 수정하기 위한 단계
      {
        $addFields: {
          // 현재 유저의 정보 추가
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] }, // 현재 유저의 userId (배열의 첫 번째 요소)
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
          },
          // 신고된 모집글의 정보 추가
          //   postId: {
          //     postId: { $arrayElemAt: ["$reportedPost.postId", 0] }, // 신고된 모집글의 postId (배열의 첫 번째 요소)
          //     postTitle: { $arrayElemAt: ["$reportedPost.postTitle", 0] }, // 신고된 모집글의 제목 (배열의 첫 번째 요소)
          //   },
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
          userId: 1, // 현재 유저의 정보 (userId 객체) 포함
          postId: 1, // 신고된 모집글의 정보 (postId 객체) 포함
          reportType: {
            $switch: {
              branches: [
                { case: { $eq: ["$reportType", "R1"] }, then: "음란" },
                { case: { $eq: ["$reportType", "R2"] }, then: "폭력" },
                { case: { $eq: ["$reportType", "R3"] }, then: "욕설" },
              ],
              default: "기타",
            },
          }, // 신고 유형 포함
          reportDetail: 1, // 신고 상세 포함
          reportFalse: {
            $switch: {
              branches: [
                { case: { $eq: ["$reportFalse", 0] }, then: "처리 전" },
                { case: { $eq: ["$reportFalse", 1] }, then: "허위 신고" },
                { case: { $eq: ["$reportFalse", 2] }, then: "처리 완료" },
              ],
              default: "중복 신고",
            },
          }, // 신고 허위 여부 포함
          reportDate: {
            $dateToString: {
              format: "%Y%m%d", // 날짜 형식을 YYYYMMDD로 지정
              date: "$reportDate", // Report 문서의 reportDate 필드 값
            },
          }, // 신고 날짜 포함 (YYYYMMDD 형식으로 변환)
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error); // 에러가 발생하면 콘솔에 출력
  }
};

// 사용자 신고한 목록 가져오기
export const getReports = () => {
  try {
    return Report.aggregate([
      {
        $lookup: {
          from: "users", // 참조할 컬렉션 이름 (users 컬렉션)
          localField: "userId", // Report 컬렉션의 필드 (userId)
          foreignField: "userId", // users 컬렉션의 필드 (userId)
          as: "currentUser", // 결과가 저장될 필드 이름
        },
      },

      // 신고된 모집글의 정보를 불러오기 위한 단계
      //   {
      //     $lookup: {
      //       from: "posts", // 참조할 컬렉션 이름 (posts 컬렉션)
      //       localField: "postId", // Report 컬렉션의 필드 (postId)
      //       foreignField: "postId", // posts 컬렉션의 필드 (postId)
      //       as: "reportedPost", // 결과가 저장될 필드 이름
      //     },
      //   },

      // 필드를 추가하거나 수정하기 위한 단계
      {
        $addFields: {
          // 현재 유저의 정보 추가
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] }, // 현재 유저의 userId (배열의 첫 번째 요소)
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
          },
          // 신고된 모집글의 정보 추가
          //   postId: {
          //     postId: { $arrayElemAt: ["$reportedPost.postId", 0] }, // 신고된 모집글의 postId (배열의 첫 번째 요소)
          //     postTitle: { $arrayElemAt: ["$reportedPost.postTitle", 0] }, // 신고된 모집글의 제목 (배열의 첫 번째 요소)
          //   },
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
          userId: 1, // 현재 유저의 정보 (userId 객체) 포함
          postId: 1, // 신고된 모집글의 정보 (postId 객체) 포함
          reportType: {
            $switch: {
              branches: [
                { case: { $eq: ["$reportType", "R1"] }, then: "음란" },
                { case: { $eq: ["$reportType", "R2"] }, then: "폭력" },
                { case: { $eq: ["$reportType", "R3"] }, then: "욕설" },
              ],
              default: "기타",
            },
          }, // 신고 유형 포함
          reportDetail: 1, // 신고 상세 포함
          reportFalse: {
            $switch: {
              branches: [
                { case: { $eq: ["$reportFalse", 0] }, then: "처리 전" },
                { case: { $eq: ["$reportFalse", 1] }, then: "허위 신고" },
                { case: { $eq: ["$reportFalse", 2] }, then: "처리 완료" },
              ],
              default: "중복 신고",
            },
          }, // 신고 허위 여부 포함
          reportDate: {
            $dateToString: {
              format: "%Y%m%d", // 날짜 형식을 YYYYMMDD로 지정
              date: "$reportDate", // Report 문서의 reportDate 필드 값
            },
          }, // 신고 날짜 포함 (YYYYMMDD 형식으로 변환)
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
