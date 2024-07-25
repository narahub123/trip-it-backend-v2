import {
  createBlock,
  deleteBlock,
  getBlockByUserId,
  getBlocks,
} from "../apis/blocks";
import express from "express";

// 차단하기
export const addBlock = async (req: express.Request, res: express.Response) => {
  const { userId } = req.user;
  const { blockedId } = req.body;
  try {
    if (!blockedId) {
      return res.status(400).json({ code: 1, msg: "차단당한 유저 없음" });
    }

    const block = await createBlock(userId, blockedId);

    if (!block._id) {
      return res.status(400).json({ code: 2, msg: "차단 실패" });
    }

    return res.status(201).json({ code: "ok", msg: "차단 성공" });
  } catch (error) {
    if (error.message) {
      return res.status(409).json({ code: 4, msg: "이미 차단한 유저" });
    }
    return res.status(500).json({ code: 3, msg: "서버 오류" });
  }
};

// 사용자가 차단한 목록 가져오기
export const fetchBlock = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId } = req.user;

    // aggregate
    const result = await getBlockByUserId(userId);

    return res.status(200).json(result);
    // return block;
  } catch (error) {
    console.log(error);
  }
};

// 관리자 페이지에서 차단한 목록 가져오기
export const fetchBlocks = async (
  req: express.Request,
  res: express.Response
) => {
  const { sortKey, sortValue } = req.query;
  // 페이징
  // pagination
  const limit = Number(req.query.size);
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;
  try {
    // aggregate
    const result = await getBlocks(
      sortKey.toString(),
      sortValue.toString(),
      skip,
      limit
    );

    // 배열에 담겨서 돌려주기 때문에 배열을 걷어냄
    const blocks = result[0];
    return res.status(200).json(blocks);
    // return block;
  } catch (error) {
    console.log(error);
  }
};

// 사용자 차단 해제 기능을 처리하는 API 핸들러 함수
export const unBlockUser = async (
  req: express.Request, // 요청 객체
  res: express.Response // 응답 객체
) => {
  // 요청에서 현재 사용자 ID와 차단 해제할 ID를 추출
  const { userId } = req.user;
  const { blockId } = req.body;

  // 차단 해제할 ID가 제공되지 않은 경우, 잘못된 요청 응답 반환
  if (!blockId) {
    return res.status(400).json({ code: 1, msg: "잘못된 요청" });
  }

  try {
    // 차단 해제 작업 수행
    const response = await deleteBlock(blockId);

    // 차단 해제 작업의 응답을 로그에 출력
    console.log(response);

    // 차단 해제 성공 시, 성공 응답 반환
    return res.status(200).json({ code: "ok", msg: "해제 성공" });
  } catch (error) {
    // 오류 발생 시, 오류를 로그에 출력
    console.log(error);

    // 서버 오류 발생 시, 서버 오류 응답 반환
    return res.status(500).json({ code: 2, msg: "서버 오류" });
  }
};
