export interface FacebookCatalogApiResponse {
  http_status_code: number;
  http_status_msg: string;
  success: boolean;
  data?: FacebookCatalogData | null;
  message: string;
  timestamp: string;
}

export interface FacebookCatalogData {
  count: number;
  products: FacebookCatalogProduct[];
}

export type FacebookCatalogProduct = {
  id: string;
  title: string;
  description: string;
  availability: string;
  condition: string;
  link: string;
  image_link: string;
  brand: string;
  price: string;
  google_product_category: string;
  fb_product_category: string;
  quantity_to_sell_on_facebook: string;
  sale_price: string;
  sale_price_effective_date: string;
  item_group_id: string;
  gender: string;
  color: string;
  size: string;
  age_group: string;
  material: string;
  pattern: string;
  shipping: string;
  shipping_weight: string;
  offer_disclaimer: string;
  offer_disclaimer_url: string;
  "video[0].url": string;
  "video[0].tag[0]": string;
  gtin: string;
  "product_tags[0]": string;
  "product_tags[1]": string;
  "style[0]": string;
};
