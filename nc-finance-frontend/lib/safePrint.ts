// NC Finance Code Note: Helper print/export agar teks aman.
// Komentar ini ditambahkan untuk dokumentasi UAS agar fungsi file mudah dipahami saat presentasi/demo.
export function openHtmlDocument(html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer,width=1100,height=800");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return win;
}

export function openDataUrlPreview(dataUrl: string) {
  if (!/^data:(image\/(jpeg|png)|application\/pdf);base64,/.test(dataUrl)) return;
  fetch(dataUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    })
    .catch(() => undefined);
}

export function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
