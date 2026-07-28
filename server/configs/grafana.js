import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const grafanaClient = axios.create({
  baseURL: process.env.GRAFANA_URL,
  headers: {
    Authorization: `Bearer ${process.env.GRAFANA_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

export default grafanaClient;