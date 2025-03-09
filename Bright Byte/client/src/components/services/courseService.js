import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export const fetchCourse = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  console.log("Course fetched:", response.data);
  return response.data;
};

export const fetchRecordedSession = async (courseId, sessionId) => {
  const response = await api.get(`/courses/${courseId}/sessions/${sessionId}`);
  console.log("Fetched recorded session:", response.data);
  // Prepend base URL for disk storage
  const sessionData = { ...response.data, url: `http://localhost:3000${response.data.url}` };
  return sessionData;
};