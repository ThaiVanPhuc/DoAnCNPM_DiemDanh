const isProduction = window.location.hostname !== "localhost";
const urlBackend = isProduction
  ? "https://naylachocloud"
  : "http://localhost:5000";

export const getImageUrl = (imgPath) => {
  if (!imgPath) return "";
  if (!imgPath.startsWith("/")) imgPath = "/" + imgPath;
  return `${urlBackend}${imgPath}`;
};
