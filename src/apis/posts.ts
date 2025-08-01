import mongoose, { Types } from "mongoose";
import { Post } from "../db/posts";
import { PostType } from "../types/posts";
import { metros } from "../data/metros";

// 마이페이지에서 특정 사용자 ID에 해당하는 모집글 목록을 가져오는 함수
export const getPostsByUserId = (userId: Types.ObjectId) => {
  try {
    return Post.aggregate([
      // 1. 특정 userId와 일치하는 문서를 찾기 위한 단계
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      // 2. 'users' 컬렉션과 조인하여 현재 유저 정보를 가져오는 단계
      {
        $lookup: {
          from: "users", // 조인할 컬렉션
          localField: "userId", // 현재 컬렉션의 필드
          foreignField: "userId", // 조인할 컬렉션의 필드
          as: "currentUser", // 조인 결과를 저장할 배열 필드
        },
      },

      // 3. 'schedules' 컬렉션과 조인하여 스케줄 정보를 가져오는 단계
      {
        $lookup: {
          from: "schedules", // 조인할 컬렉션
          localField: "scheduleId", // 현재 컬렉션의 필드
          foreignField: "scheduleId", // 조인할 컬렉션의 필드
          as: "userSchedule", // 조인 결과를 저장할 배열 필드
        },
      },

      // 4. 조인 결과를 사용하여 필드를 추가하거나 수정하는 단계
      {
        $addFields: {
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] }, // 현재 유저의 userId (배열의 첫 번째 요소)
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
          },

          scheduleId: {
            scheduleId: { $arrayElemAt: ["$userSchedule.scheduleId", 0] }, // 스케줄 ID (배열의 첫 번째 요소)
            scheduleTitle: { $arrayElemAt: ["$userSchedule.scheduleTitle", 0] }, // 스케줄 제목 (배열의 첫 번째 요소)
          },
        },
      },

      // 5. 모집글을 작성 날짜 기준으로 내림차순으로 정렬하는 단계
      {
        $sort: {
          postDate: -1, // postDate 필드를 기준으로 내림차순 정렬
        },
      },

      // 6. 필요한 필드만 선택하여 결과를 반환하기 위한 단계
      {
        $project: {
          postId: 1, // 포함할 필드
          scheduleId: 1, // 포함할 필드
          userId: 1, // 포함할 필드
          postTitle: 1, // 포함할 필드
          postContent: 1, // 포함할 필드
          personnel: 1, // 포함할 필드
          postDate: {
            $dateToString: {
              format: "%Y%m%d", // 날짜 형식을 YYYYMMDD로 지정
              date: "$postDate", // 모집글의 작성 날짜 필드
            },
          }, // 모집글 작성 날짜 포함 (YYYYMMDD 형식으로 변환)
          postPic: 1, // 포함할 필드
          recruitStatus: {
            $switch: {
              branches: [
                { case: { $eq: ["$recruitStatus", true] }, then: "모집중" }, // 모집 중인 경우
                { case: { $eq: ["$recruitStatus", false] }, then: "모집완료" }, // 모집 완료인 경우
              ],
            },
          },
          viewCount: 1, // 포함할 필드
          exposureStatus: {
            $switch: {
              branches: [
                { case: { $eq: ["$exposureStatus", true] }, then: "노출중" }, // 노출 중인 경우
                { case: { $eq: ["$exposureStatus", false] }, then: "노출차단" }, // 노출 차단된 경우
              ],
            },
          },
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error); // 에러가 발생하면 콘솔에 에러 로그를 출력
  }
};

// 관리자 페이지에서 모집글 목록을 가져오는 함수
export const getPosts = (
  sortKey: string, // 정렬할 필드
  sortValue: string, // 정렬 방향 (오름차순 또는 내림차순)
  skip: number, // 페이지네이션을 위해 스킵할 문서 수
  limit: number, // 페이지네이션을 위해 반환할 문서 수
  field: string, // 검색할 필드
  search: string // 검색어
) => {
  try {
    return Post.aggregate([
      // 1. 'users' 컬렉션과 조인하여 현재 유저 정보를 가져오는 단계
      {
        $lookup: {
          from: "users", // 조인할 컬렉션
          localField: "userId", // 현재 컬렉션의 필드
          foreignField: "userId", // 조인할 컬렉션의 필드
          as: "currentUser", // 조인 결과를 저장할 배열 필드
        },
      },

      // 2. 'schedules' 컬렉션과 조인하여 스케줄 정보를 가져오는 단계
      {
        $lookup: {
          from: "schedules", // 조인할 컬렉션
          localField: "scheduleId", // 현재 컬렉션의 필드
          foreignField: "scheduleId", // 조인할 컬렉션의 필드
          as: "userSchedule", // 조인 결과를 저장할 배열 필드
        },
      },

      // 3. 조인 결과를 사용하여 필드를 추가하거나 수정하는 단계
      {
        $addFields: {
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] }, // 현재 유저의 userId (배열의 첫 번째 요소)
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
            birth: { $arrayElemAt: ["$currentUser.birth", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
            gender: { $arrayElemAt: ["$currentUser.gender", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
          },

          scheduleId: {
            scheduleId: { $arrayElemAt: ["$userSchedule.scheduleId", 0] }, // 스케줄 ID (배열의 첫 번째 요소)
            scheduleTitle: { $arrayElemAt: ["$userSchedule.scheduleTitle", 0] }, // 스케줄 제목 (배열의 첫 번째 요소)
            startDate: { $arrayElemAt: ["$userSchedule.startDate", 0] }, // 스케줄 제목 (배열의 첫 번째 요소)
            endDate: { $arrayElemAt: ["$userSchedule.endDate", 0] }, // 스케줄 제목 (배열의 첫 번째 요소)
          },
        },
      },

      // 4. 검색어를 필드와 비교하여 일치하는 문서만 필터링하는 단계
      {
        $match: {
          [field]: { $regex: search, $options: "i" }, // 필드 값이 검색어와 일치하는 문서만 반환
        },
      },

      // 5. 필요한 필드만 선택하여 결과를 반환하는 단계
      {
        $project: {
          postId: 1, // 포함할 필드
          scheduleId: 1, // 포함할 필드
          userId: 1, // 포함할 필드
          postTitle: 1, // 포함할 필드
          postContent: 1, // 포함할 필드
          personnel: 1, // 포함할 필드
          postDate: {
            $dateToString: {
              format: "%Y%m%d", // 날짜 형식을 YYYYMMDD로 지정
              date: "$postDate", // 모집글의 작성 날짜 필드
            },
          }, // 모집글 작성 날짜 포함 (YYYYMMDD 형식으로 변환)
          postPic: 1, // 포함할 필드
          recruitStatus: {
            $switch: {
              branches: [
                { case: { $eq: ["$recruitStatus", true] }, then: "모집중" }, // 모집 중인 경우
                { case: { $eq: ["$recruitStatus", false] }, then: "모집완료" }, // 모집 완료인 경우
              ],
            },
          },
          viewCount: 1, // 포함할 필드
          exposureStatus: {
            $switch: {
              branches: [
                { case: { $eq: ["$exposureStatus", true] }, then: "노출중" }, // 노출 중인 경우
                { case: { $eq: ["$exposureStatus", false] }, then: "노출차단" }, // 노출 차단된 경우
              ],
            },
          },
        },
      },

      // 6. 정렬, 페이지네이션 및 전체 요소 수 계산을 위한 단계
      {
        $facet: {
          content: [
            // 동적으로 정렬하기 위한 단계
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

      // 7. totalElements 배열을 평평하게 만들고 기본값을 설정하는 단계
      {
        $addFields: {
          totalElements: {
            $ifNull: [{ $arrayElemAt: ["$totalElements.count", 0] }, 0], // totalElements가 없는 경우 기본값 0 추가
          },
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error); // 에러가 발생하면 콘솔에 에러 로그를 출력
  }
};

export const getPostByPostId = (postId: Types.ObjectId) => {
  try {
    return Post.findOne({ _id: postId });
  } catch (error) {
    throw error;
  }
};

// 모집글 삭제하기
export const deletePosts = (postIds: Types.ObjectId[]) => {
  try {
    return Post.deleteMany({ postId: { $in: postIds } });
  } catch (error) {
    throw error;
  }
};

// 모집글 등록
export const createPost = (post: PostType) => {
  try {
    const newPost = new Post({
      postId: post.postId,
      userId: post.userId,
      scheduleId: post.scheduleId,
      postTitle: post.postTitle,
      postContent: post.postContent,
      postPic: post.postPic,
      personnel: post.personnel,
      recruitStatus: post.recruitStatus,
      viewCount: post.viewCount,
      exposureStatus: post.exposureStatus,
      _id: post.postId,
    });

    return newPost.save();
  } catch (error) {
    throw { error };
  }
};

// 게스트 모집글 목록
export const getPostsByGuest = (
  skip: number, // 페이지네이션을 위해 스킵할 문서 수
  limit: number, // 페이지네이션을 위해 반환할 문서 수
  sortKey?: string,
  metroId?: string,
  search?: string
) => {
  try {
    const matchStage: any = {};

    const metroName =
      metros.find((metro) => metro.areaCode === metroId)?.name || "";

    // metroId가 "0"이 아닌 경우와 search가 정의된 경우에만 matchStage에 조건 추가
    if (metroId && metroId !== "0") {
      matchStage[`metroName`] = { $regex: metroName, $options: "i" };
    }

    if (search) {
      matchStage[`postTitle`] = { $regex: search, $options: "i" };
    }

    return Post.aggregate([
      // 1. 'users' 컬렉션과 조인하여 현재 유저 정보를 가져오는 단계
      {
        $lookup: {
          from: "users", // 조인할 컬렉션
          localField: "userId", // 현재 컬렉션의 필드
          foreignField: "userId", // 조인할 컬렉션의 필드
          as: "currentUser", // 조인 결과를 저장할 배열 필드
        },
      },

      // 2. 'schedules' 컬렉션과 조인하여 스케줄 정보를 가져오는 단계
      {
        $lookup: {
          from: "schedules", // 조인할 컬렉션
          localField: "scheduleId", // 현재 컬렉션의 필드
          foreignField: "scheduleId", // 조인할 컬렉션의 필드
          as: "userSchedule", // 조인 결과를 저장할 배열 필드
        },
      },

      // 3. 조인 결과를 사용하여 필드를 추가하거나 수정하는 단계
      {
        $addFields: {
          userId: { $arrayElemAt: ["$currentUser.userId", 0] }, // 현재 유저의 userId (배열의 첫 번째 요소)
          nickname: { $arrayElemAt: ["$currentUser.nickname", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
          gender: { $arrayElemAt: ["$currentUser.gender", 0] }, // 성별
          birth: { $arrayElemAt: ["$currentUser.birth", 0] }, // 생년월일
          userpic: { $arrayElemAt: ["$currentUser.userpic", 0] }, // 사용자 프로필 사진

          scheduleId: { $arrayElemAt: ["$userSchedule.scheduleId", 0] }, // 스케줄 ID
          startDate: { $arrayElemAt: ["$userSchedule.startDate", 0] }, // 스케줄 시작 날짜
          endDate: { $arrayElemAt: ["$userSchedule.endDate", 0] }, // 스케줄 종료 날짜
          metroId: { $arrayElemAt: ["$userSchedule.metroId", 0] },
        },
      },

      // 4. 필요한 필드만 선택하여 결과를 반환하는 단계
      {
        $project: {
          postId: 1, // 포함할 필드
          scheduleId: 1, // 포함할 필드
          startDate: 1, // 포함할 필드
          endDate: 1, // 포함할 필드
          metroId: 1,
          metroName: metros.find((metro) => metro.areaCode === metroId)?.name, // 포함할 필드
          userId: 1, // 포함할 필드
          nickname: 1, // 포함할 필드
          gender: 1, // 포함할 필드
          birth: 1, // 포함할 필드
          userpic: 1, // 포함할 필드
          postTitle: 1, // 포함할 필드
          postContent: 1, // 포함할 필드
          personnel: 1, // 포함할 필드
          postPic: 1, // 포함할 필드
          postDate: 1, // 포함할 필드
          recruitStatus: 1, // true/false로 반환
          viewCount: 1, // 포함할 필드
          exposureStatus: 1, // true/false로 반환
        },
      },

      // matchStage가 비어있지 않은 경우에만 $match 적용
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),

      // 5. 정렬, 페이지네이션을 위한 단계
      {
        $sort: {
          [sortKey]: -1, // postDate 기준 내림차순 정렬
        },
      },
      {
        $skip: skip, // 페이징을 위해 결과를 skip만큼 건너뜀
      },
      {
        $limit: limit, // 페이징을 위해 결과를 limit만큼 제한함
      },
    ]).exec();
  } catch (error) {
    console.log(error); // 에러가 발생하면 콘솔에 에러 로그를 출력
  }
};

// 상세 보기
export const getPost = async (
  userId: Types.ObjectId,
  postId: Types.ObjectId
) => {
  try {
    return Post.findOne({ userId, postId });
  } catch (error) {
    throw { error };
  }
};
