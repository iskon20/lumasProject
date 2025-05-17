let recognizedText = "";

const recognitionContainer = document.getElementById("recognition-animation");
const recognitionAnimation = lottie.loadAnimation({
  container: recognitionContainer,
  renderer: "svg",
  loop: true,
  autoplay: false,
  path: "../../assets/speak/userSpeak.json",
});

const container = document.getElementById("voice-animation");
const speakAnimation = lottie.loadAnimation({
  container: container,
  renderer: "svg",
  loop: true,
  autoplay: false,
  path: "../../assets/speak/chatSpeak.json",
});

const containerLoader = document.getElementById("loader-animation");
const LoaderAnimation = lottie.loadAnimation({
  container: containerLoader,
  renderer: "svg",
  loop: true,
  autoplay: false,
  path: "../../assets/loader.json",
});

let btnRecord = document.getElementById("startRecord");

function startRecognition() {
  let hasResult = false
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "ru-RU";
  recognition.interimResults = false;

  btnRecord.classList.add("activeShrink");

  btnRecord.addEventListener("animationend", function handler() {
    btnRecord.classList.remove("activeShrink");
    btnRecord.style.display = "none";
    recognitionContainer.style.display = "block";
    recognitionAnimation.play();

    btnRecord.removeEventListener("animationend", handler);
  });

  recognition.onend = () => {
    if (!hasResult) {
      btnRecord.style.display = "flex";
    }
    recognitionAnimation.stop();
    recognitionContainer.style.display = "none";
  };

  recognition.onresult = (event) => {
    recognizedText = event.results[0][0].transcript;
    hasResult = true;
    sendToGPT(recognizedText);
    recognitionAnimation.stop();
    recognitionContainer.style.display = "none";
  };

  recognition.onerror = (event) => {
    console.error("Ошибка распознавания:", event.error);

    recognitionAnimation.stop();
    recognitionContainer.style.display = "none";

    btnRecord.style.display = "flex";
  };

  recognition.start();
}

async function sendToGPT() {
  if (!recognizedText) return;

  containerLoader.style.display = "block";
  LoaderAnimation.play();

  try {
    const response = await fetch("http://lumasback-production.up.railway.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: recognizedText }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ошибка от GPT:", data.error);
      document.getElementById("result").textContent +=
        "\nОшибка: " + data.error;
      return;
    }

    const reply = data.choices[0].message.content;
    speakText(reply);
  } catch (err) {
    console.error("Ошибка запроса:", err);
  }
}
async function handleSend() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  addMessageToChat(message, "user");
  input.value = "";

  const loadingDiv = addMessageToChat("...", "gpt", true);

  try {
    const res = await fetch("http://lumasback-production.up.railway.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Ошибка:", data.error);
      loadingDiv.textContent = "Ошибка: " + data.error;
      return;
    }

    const reply = data.choices[0].message.content;
    typeText(loadingDiv, reply);
  } catch (err) {
    console.error("Сетевая ошибка:", err);
    loadingDiv.textContent = "Сетевая ошибка. Попробуй позже.";
  }
}

function addMessageToChat(text, sender, returnDiv = false) {
  const container = document.getElementById("chat-container");
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = sender === "user" ? "flex-end" : "flex-start";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "8px";

  if (sender === "gpt") {
    const avatar = document.createElement("img");
    avatar.src = "../../assets/img/ChatGPTLogo.png";
    avatar.style.width = "55px";
    avatar.style.borderRadius = "50%";
    wrapper.appendChild(avatar);
  }

  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  wrapper.appendChild(div);

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;

  return returnDiv ? div : null;
}

function typeText(element, text, speed = 20) {
  element.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

addMessageToChat("Привет! Поможешь выучить английский?", "user");
addMessageToChat("Привет! Конечно, помогу.", "gpt");

async function speakText(text) {
  try {
    const response = await fetch("http://lumasback-production.up.railway.app/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Ошибка синтеза речи: " + response.statusText);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    containerLoader.style.display = "none";
    LoaderAnimation.stop();

    container.style.display = "block";
    speakAnimation.play();

    audio.onended = () => {
      speakAnimation.stop();
      container.style.display = "none";
      let btnRecord = document.getElementById("startRecord");
      btnRecord.style.display = "flex";
    };

    audio.play();
  } catch (err) {
    console.error(err);
    speakAnimation.stop();
    container.style.display = "none";

    let btnRecord = document.getElementById("startRecord");
    btnRecord.style.display = "flex";
  }
}

// function speakText(text) {
//   containerLoader.style.display = "none";
//   LoaderAnimation.stop();

//   const utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = "ru-RU";

//   utterance.onstart = () => {
//     container.style.display = "block";
//     speakAnimation.play();
//   };

//   utterance.onend = () => {
//     speakAnimation.stop();
//     container.style.display = "none";
//   };

//   speechSynthesis.speak(utterance);
// }
