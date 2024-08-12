import express from "express";
import {
  getPlaceByContentId,
  getPlacesByContentTypeId,
  getPlacesByKeyword,
} from "../apis/planner";

export const fetchPlaces = async (
  req: express.Request,
  res: express.Response
) => {
  const { areaCode, contentTypeId, pageNo } = req.params;

  try {
    const places = await getPlacesByContentTypeId(
      areaCode,
      contentTypeId,
      pageNo
    );

    if (!places) {
      return res.status(400).json({ code: 2, msg: "장소 조회 실패" });
    }

    return res.status(200).json(places);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

export const fetchPlace = async (
  req: express.Request,
  res: express.Response
) => {
  const { contentId } = req.params;

  try {
    const place = await getPlaceByContentId(contentId);

    if (!place) return res.status(400).json({ code: 2, msg: "장소 조회 실패" });

    console.log(place);

    return res.status(200).json(place);
  } catch (error) {
    console.log(error);

    if (error.code === 6) {
      console.log("api 데이터 소진");

      return res.status(422).json({ code: 6, msg: "데이터 소진" });
    }

    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

export const fetchPlacesByKeyword = async (
  req: express.Request,
  res: express.Response
) => {
  const { keyword, areaCode, contentTypeId, pageNo } = req.params;

  console.log(keyword, areaCode, contentTypeId, pageNo);

  try {
    const places = await getPlacesByKeyword(
      keyword,
      areaCode,
      contentTypeId,
      pageNo
    );

    if (!places)
      return res.status(400).json({ code: 2, msg: "장소 검색 실패" });

    return res.status(200).json(places);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};
