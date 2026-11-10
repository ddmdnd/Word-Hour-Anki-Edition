// Word Hour — Scriptable iPhone Widget
// Save words.json to iCloud Drive/Scriptable/WordHour/words.json
const fm = FileManager.iCloud();
const dir = fm.joinPath(fm.documentsDirectory(), "WordHour");
const file = fm.joinPath(dir, "words.json");
if (!fm.fileExists(dir)) fm.createDirectory(dir);
const widget = new ListWidget();
widget.backgroundColor = new Color("#292a3a");
widget.setPadding(16, 16, 14, 16);
if (!fm.fileExists(file)) {
  const t = widget.addText("Сначала сохрани words.json в iCloud Drive/Scriptable/WordHour");
  t.textColor = Color.white(); t.font = Font.systemFont(12);
} else {
  await fm.downloadFileFromiCloud(file);
  const data = JSON.parse(fm.readString(file));
  const words = data.words || [];
  function shuffle(a, seed) {
    a = [...a]; let x = seed >>> 0;
    for (let i = a.length - 1; i > 0; i--) {
      x = (x * 1664525 + 1013904223) >>> 0;
      const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function hourKey(d = new Date()) {
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 3600000);
  }
  const top = widget.addText("WORD OF THE HOUR");
  top.textColor = new Color("#bdbdd1"); top.font = Font.semiboldSystemFont(8);
  widget.addSpacer(12);
  if (words.length) {
    const n = words.length, elapsed = Math.max(0, hourKey() - (data.start || hourKey()));
    const cycle = Math.floor(elapsed / n), pos = elapsed % n;
    const order = shuffle(words, (data.seed || 1) + cycle * 7919);
    if (cycle > 0 && n > 1) {
      const prev = shuffle(words, (data.seed || 1) + (cycle - 1) * 7919);
      if (order[0].id === prev[n - 1].id) [order[0], order[1]] = [order[1], order[0]];
    }
    const word = order[pos];
    const title = widget.addText(word.word || "Word");
    title.textColor = Color.white(); title.font = Font.boldSystemFont(24);
    title.minimumScaleFactor = 0.6; title.lineLimit = 2;
    widget.addSpacer(5);
    const meaning = data.language === "uk" ? (word.uk || word.ru || "") :
      data.language === "both" ? [word.ru, word.uk].filter(Boolean).join(" · ") : (word.ru || word.uk || "");
    const translation = widget.addText(meaning);
    translation.textColor = new Color("#d2d1e2"); translation.font = Font.systemFont(13); translation.lineLimit = 2;
    if (word.transcription) {
      widget.addSpacer(4);
      const phon = widget.addText(word.transcription);
      phon.textColor = new Color("#aaaac2"); phon.font = Font.systemFont(10);
    }
  } else {
    const p = widget.addText("Добавь слова в Word Hour");
    p.textColor = Color.white(); p.font = Font.boldSystemFont(16);
  }
}
widget.addSpacer();
const footer = widget.addText("WORD HOUR ↗");
footer.textColor = new Color("#aaaac2"); footer.font = Font.semiboldSystemFont(8);
widget.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);
if (config.runsInWidget) Script.setWidget(widget); else await widget.presentMedium();
Script.complete();