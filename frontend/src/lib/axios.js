import axios from "axios";

export const Axios = axios.create({
  baseURL: "http://localhost:5800/api/v1/",
});
