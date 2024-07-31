import { Block } from "../db/blocks";
import express from "express";
import mongoose, { Types } from "mongoose";

export const getItemsById = <T>(
  model: mongoose.Model<T>,
  id: Types.ObjectId
) => {
  try {
    console.log(model, id);

    const result = model.findOne({ userId: id });

    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchItemsById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;

  try {
    const response = await getItemsById(Block, userId);

    if (!response) {
      return res.status(400).json({ code: 2, msg: "목록 조회 실패" });
    }

    console.log(response);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};
