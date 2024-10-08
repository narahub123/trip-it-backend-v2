import { saveSchedule } from "../controllers/schedules";
import {
  fetchPlace,
  fetchPlacesByKeyword,
  fetchPlaces,
} from "../controllers/planner";
import express from "express";

export default (router: express.Router) => {
  router.get(`/home/apiList/:areaCode/:pageNo/:contentTypeId`, fetchPlaces); // 전체 내용 조회
  router.get(`/home/apiDetail/:contentId/`, fetchPlace);
  router.get(
    `/home/apiSearch/:areaCode/:pageNo/:contentTypeId/:keyword`,
    fetchPlacesByKeyword
  );
  router.post(`/home/saveSchedule`, saveSchedule);
};
