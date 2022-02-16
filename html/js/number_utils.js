// 가격 3자리마다 콤마 찍어주기
const option = {
  maximumFractionDigits: 4,
};

// 가격 3자리마다 , 찍어주기
function formatPrice(price) {
  return price.toLocaleString("ko-KR", option);
}
