import mongoose, { Types } from "mongoose";
import { Block } from "../db/blocks";

// 차단 추가
export const createBlock = async (
  userId: Types.ObjectId,
  blockedId: Types.ObjectId
) => {
  try {
    const blockId = new mongoose.Types.ObjectId();

    const block = new Block({
      blockId,
      userId,
      blockedId,
      _id: blockId,
    });

    return await block.save();
  } catch (error) {
    const code = error.code;
    throw new Error(code);
  }
};

// 관리자 페이지 차단 목록 가져오기
export const getBlocks = (
  sortKey: string,
  sortValue: string,
  skip: number,
  limit: number
) => {
  try {
    return Block.aggregate([
      // 현재 유저(차단한 유저)의 정보를 불러오기 위한 단계
      {
        $lookup: {
          from: "users", // 참조할 컬렉션 이름 (users 컬렉션), mongoDB 컬랙션과 일치시켜야함
          localField: "userId", // Block 컬렉션의 필드 (userId)
          foreignField: "userId", // users 컬렉션의 필드 (userId)
          as: "currentUser", // 결과가 저장될 필드 이름
        },
      },

      // 차단 당한 유저의 정보를 불러오기 위한 단계
      {
        $lookup: {
          from: "users", // 참조할 컬렉션 이름 (users 컬렉션)
          localField: "blockedId", // Block 컬렉션의 필드 (blockedId)
          foreignField: "userId", // users 컬렉션의 필드 (userId)
          as: "blockedUser", // 결과가 저장될 필드 이름
        },
      },

      // 필드를 추가하거나 수정하기 위한 단계
      {
        $addFields: {
          // 현재 유저의 정보 추가
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] }, // 현재 유저의 userId (배열의 첫 번째 요소)
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
          },
          nickname: { $arrayElemAt: ["$blockedUser.nickname", 0] }, // 차단 당한 유저의 닉네임 (배열의 첫 번째 요소)
        },
      },

      // 필요한 필드만 선택하여 결과를 반환하기 위한 단계
      {
        $project: {
          blockId: 1, // Block 문서의 blockId 필드
          userId: 1, // 추가된 현재 유저의 정보 (userId 객체)
          blockedId: 1, // Block 문서의 blockedId 필드
          nickname: 1, // 추가된 차단 당한 유저의 닉네임
          blockDate: 1, // Block 문서의 blockDate 필드
        },
      },
      {
        $facet: {
          content: [
            // sortKey와 sortValue를 사용하여 동적으로 정렬하기 위한 단계
            {
              $sort: {
                [sortKey]: sortValue === "desc" ? -1 : 1, // sortValue가 "desc"이면 내림차순(-1), 아니면 오름차순(1)
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

      // totalElements 배열을 평평하게 만들기 위한 단계
      {
        $addFields: {
          totalElements: { $arrayElemAt: ["$totalElements.count", 0] }, // totalElements 배열의 첫 번째 요소를 평평하게
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error);
  }
};

// 사용자 차단한 목록 가져오기
export const getBlockByUserId = (userId: Types.ObjectId) => {
  try {
    return Block.aggregate([
      // 특정 userId와 일치하는 문서를 찾기 위한 단계
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      // 현재 유저(차단한 유저)의 정보를 불러오기 위한 단계
      {
        $lookup: {
          from: "users", // 참조할 컬렉션 이름 (users 컬렉션)
          localField: "userId", // Block 컬렉션의 필드 (userId)
          foreignField: "userId", // users 컬렉션의 필드 (userId)
          as: "currentUser", // 결과가 저장될 필드 이름
        },
      },

      // 차단 당한 유저의 정보를 불러오기 위한 단계
      {
        $lookup: {
          from: "users", // 참조할 컬렉션 이름 (users 컬렉션)
          localField: "blockedId", // Block 컬렉션의 필드 (blockedId)
          foreignField: "userId", // users 컬렉션의 필드 (userId)
          as: "blockedUser", // 결과가 저장될 필드 이름
        },
      },

      // 필드를 추가하거나 수정하기 위한 단계
      {
        $addFields: {
          // 현재 유저의 정보 추가
          userId: {
            userId: { $arrayElemAt: ["$currentUser.userId", 0] }, // 현재 유저의 userId (배열의 첫 번째 요소)
            nickname: { $arrayElemAt: ["$currentUser.nickname", 0] }, // 현재 유저의 닉네임 (배열의 첫 번째 요소)
          },
          nickname: { $arrayElemAt: ["$blockedUser.nickname", 0] }, // 차단 당한 유저의 닉네임 (배열의 첫 번째 요소)
        },
      },

      // 차단된 날짜를 기준으로 내림차순 정렬하기 위한 단계
      {
        $sort: {
          blockDate: -1, // blockDate를 기준으로 내림차순 정렬 (-1)
        },
      },

      // 필요한 필드만 선택하여 결과를 반환하기 위한 단계
      {
        $project: {
          blockId: 1, // Block 문서의 blockId 필드
          userId: 1, // 추가된 현재 유저의 정보 (userId 객체)
          blockedId: 1, // Block 문서의 blockedId 필드
          nickname: 1, // 추가된 차단 당한 유저의 닉네임
          blockDate: 1, // Block 문서의 blockDate 필드
        },
      },
    ]).exec();
  } catch (error) {
    console.log(error);
  }
};
