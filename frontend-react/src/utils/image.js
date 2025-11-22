const isProduction = window.location.hostname !== "localhost";
const urlBackend = isProduction
  ? "https://cloud-computing-nhom8.onrender.com"
  : "http://localhost:5000";

export const getImageUrl = (imgPath) => {
  if (!imgPath) return "";
  if (!imgPath.startsWith("/")) imgPath = "/" + imgPath;
  return `${urlBackend}${imgPath}`;
};
