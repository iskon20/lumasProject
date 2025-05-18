const loaderContainer = document.getElementById("loader");
const anim = lottie.loadAnimation({
  container: loaderContainer,
  renderer: "svg",
  loop: true,
  autoplay: false,
  path: "../../assets/loader.json",
});

document.getElementById("swapLangs").onclick = () => {
  const source = document.getElementById("sourceLang");
  const target = document.getElementById("targetLang");
  const temp = source.value;
  source.value = target.value;
  target.value = temp;
};

function translateText() {
  const text = document.getElementById("text").value;
  const sourceLang = document.getElementById("sourceLang").value;
  const targetLang = document.getElementById("targetLang").value;
  const resultDiv = document.getElementById("translation");
  if (!text) {
    resultDiv.textContent = "Введите текст!";
    return;
  }
  resultDiv.textContent = "";
  loaderContainer.style.display = "block";
  anim.play();

  fetch(
    "https://translate.yandex.net/api/v1/tr.json/translate?id=26e942a2863b3e4e9f6114135903f63d-0-0&srv=android",
    {
      method: "POST",
      headers: {
        "User-Agent":
          "ru.yandex.translate/86.9.30860900 (Xiaomi M2012K11AG; Android 13)",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        source_lang: sourceLang,
        target_lang: targetLang,
        text: text,
      }),
    }
  )
    .then((response) => {
      if (!response.ok) throw new Error("Error: " + response.status);
      return response.json();
    })
    .then((data) => {
      loaderContainer.style.display = "none";
      anim.stop();
      resultDiv.textContent = data.text ? data.text[0] : "Translate is not defined";
    })
    .catch((err) => {
      loaderContainer.style.display = "none";
      anim.stop();
      resultDiv.textContent = "Error: " + err.message;
    });
}
