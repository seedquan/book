const progress = document.querySelector(".reading-progress i");
const updateProgress = () => {
  const top = document.documentElement.scrollTop || document.body.scrollTop;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const value = total > 0 ? Math.min(100, Math.round((top / total) * 100)) : 0;
  progress.style.width = `${value}%`;
  localStorage.setItem("moonlight-book-progress", String(value));
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
