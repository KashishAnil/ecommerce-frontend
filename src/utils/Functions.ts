import { BASE_NAME } from "../constants/api";


export const ImageUrl = (image: string) =>
  `${BASE_NAME}/images/${image}`.replace("//", "/");
