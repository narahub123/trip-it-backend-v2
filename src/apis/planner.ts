import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.TOUR_API_KEY;

export const getPlacesByContentTypeId = async (
  areaCode: string,
  contentTypeId: string,
  pageNo: string
) => {
  const numOfRows = 8;

  console.log("장소들 요청", areaCode, contentTypeId);

  const apiUrl = `http://apis.data.go.kr/B551011/KorService2/areaBasedList1?serviceKey=${apiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&MobileApp=AppTest&MobileOS=ETC&arrange=A&areaCode=${areaCode}&contentTypeId=${contentTypeId}&_type=json`;

  try {
    const res = await axios.get(apiUrl);

    return res.data.response.body.items.item;
  } catch (error) {
    console.log("여기");

    throw error;
  }
};

export const getPlaceByContentId = async (contentId: string) => {
  const pageNo = 1;
  const numOfRows = 10;

  console.log("장소 요청", contentId);

  const apiUrl = `http://apis.data.go.kr/B551011/KorService2/detailCommon1?serviceKey=${apiKey}&MobileApp=AppTest&MobileOS=ETC&contentId=${contentId}&_type=json&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&pageNo=${pageNo}&numOfRows=${numOfRows}`;

  try {
    const res = await axios.get(apiUrl);

    return res.data.response.body.items.item;
  } catch (error) {
    console.log(error.name);

    if (error.name === "TypeError") {
      throw { code: 6 };
    }
    throw error;
  }
};

export const getPlacesByKeyword = async (
  keyword: string,
  areaCode: string,
  contentTypeId: string,
  pageNo: string
) => {
  const numOfRows = 8;

  const apiUrl = `http://apis.data.go.kr/B551011/KorService2/searchKeyword1?serviceKey=${apiKey}&MobileApp=AppTest&MobileOS=ETC&_type=json&listYN=Y&arrange=A&pageNo=${pageNo}&numOfRows=${numOfRows}&contentTypeId=${contentTypeId}&keyword=${keyword}&areaCode=${areaCode}`;

  try {
    const res = await axios.get(apiUrl);

    if (res.data.response.body.items === "") {
      return [];
    }

    return res.data.response.body.items.item;
  } catch (error) {
    console.log("여기");
    throw error;
  }
};
