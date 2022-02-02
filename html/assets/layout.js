document.querySelectorAll("*[data-init]").forEach(async (v, i) => {
  const init = v.dataset.init;
  let html = null;

  try {
    // html 파일을 가져온다.
    const response = await axios.get(init);
    html = response.data;
    // console.log(html);
  } catch (e) {
    console.error(e);
  }
  // outerjoin으로 태그 전체를 바꾼다.
  if (html != null) {
    v.outerHTML = html;
  }
});
