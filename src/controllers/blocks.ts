import { Block } from "../db/blocks";
import { createBlock, getBlockByUserId, getBlocks } from "../apis/blocks";
import express from "express";
import mongoose from "mongoose";

// 차단하기
export const addBlock = async (req: express.Request, res: express.Response) => {
  const { userId } = req.user;
  const { blockedId } = req.body;
  try {
    if (!blockedId) {
      return res.status(400).json({ code: 1, msg: "차단당한 유저 없음" });
    }

    const block = await createBlock(userId, blockedId);

    if (!block) {
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
