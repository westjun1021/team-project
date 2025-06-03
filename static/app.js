document.getElementById('result').addEventListener('click', async e => {
  if (!e.target.classList.contains('bookmark-btn')) return;
  const btn = e.target;
  const pid = btn.dataset.paperId;
  const title = btn.dataset.paperTitle;
  const authors = btn.dataset.paperAuthors;
  const published_year = btn.dataset.paperYear;
  const bid = btn.dataset.bookmarkId;
  const token = localStorage.getItem('token');
  if (!token) return alert('로그인이 필요합니다!');

  try {
    if (btn.classList.contains('bookmarked')) {
      await apiSend(`/bookmarks/${bid}`, { method: 'DELETE' });
      btn.classList.remove('bookmarked');
      btn.textContent = '즐겨찾기 추가';
      btn.dataset.bookmarkId = '';
    } else {
      const { id } = await apiSend('/bookmarks/', {
        body: {
          paper_id: pid,
          title: title,
          authors: authors,
          published_year: published_year
        }
      });
      btn.classList.add('bookmarked');
      btn.textContent = '즐겨찾기 해제';
      btn.dataset.bookmarkId = id;
    }
  } catch {
    alert('즐겨찾기 처리 중 오류가 발생했습니다.');
  }
});
