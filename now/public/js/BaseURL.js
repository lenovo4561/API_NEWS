// LifeNewsHub_server 兼容接口
// 本地开发环境
const SERVER_BASE_URL = "http://localhost:3000/api/compatible";

// 生产环境（取消注释下面一行，并注释上面的本地地址）
// const SERVER_BASE_URL = "https://your-domain.com/api/compatible";

export const BASE_URL = `${SERVER_BASE_URL}/db.json`;
export const IMG_BASE_URL = SERVER_BASE_URL;
export const Category_URL = `${SERVER_BASE_URL}/db.json`;

export async function getCategoryOrder() {
  try {
    const response = await fetch(Category_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch category order: ${response.status}`);
    }
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0] && data[0].info1) {
      return data[0].info1;
    }

    return [
      "Mental Health",
      "Medical Care",
      "Lifestyle",
      "Emergency & Safety",
      "Beauty & Wellness",
      "Health Management",
    ];
  } catch (error) {
    return [
      "Mental Health",
      "Medical Care",
      "Lifestyle",
      "Emergency & Safety",
      "Beauty & Wellness",
      "Health Management",
    ];
  }
}

export function getDataBaseUrl() {
  return SERVER_BASE_URL;
}

export function getImgUrl(article) {
  // 如果文章包含完整的图片URL，直接使用
  if (article.img && article.img.startsWith("http")) {
    return article.img;
  }

  const baseUrl = getDataBaseUrl();

  if (!article.img) {
    return `${baseUrl}/${article.id}/1.png`;
  }

  let imgFileName = article.img;
  if (imgFileName.includes("/")) {
    imgFileName = imgFileName.split("/").pop();
  }

  return `${baseUrl}/${article.id}/${imgFileName}`;
}
