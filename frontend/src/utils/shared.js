const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

export const dishImage = (img) => {
  if (!img || img === "{}") return "";

  if (img.startsWith("data:")) return img;
  if (img.startsWith("http")) return img;

  if (img.startsWith("/uploads/")) {
    return `${API_BASE_URL}${img}`;
  }

  return `${API_BASE_URL}/uploads/anh-mon/${img}`;
};