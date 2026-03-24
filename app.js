const form = document.getElementById("submissionForm");
const outputBox = document.getElementById("outputBox");
const statusMessage = document.getElementById("statusMessage");
const copyJsonBtn = document.getElementById("copyJson");

const canvas = document.getElementById("signaturePad");
const clearBtn = document.getElementById("clearSignature");
const undoBtn = document.getElementById("undoSignature");

const ctx = canvas.getContext("2d");
let drawing = false;
let currentStroke = [];
let strokes = [];
let hasSignature = false;

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  canvas.width = Math.floor(displayWidth * ratio);
  canvas.height = Math.floor(displayHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  redrawAllStrokes();
}

function setDrawingStyle() {
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1e293b";
}

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function redrawAllStrokes() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  setDrawingStyle();

  strokes.forEach((stroke) => {
    if (stroke.length === 1) {
      const p = stroke[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i += 1) {
      const point = stroke[i];
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  });

  hasSignature = strokes.length > 0;
}

function startDrawing(event) {
  drawing = true;
  currentStroke = [getPoint(event)];
  canvas.setPointerCapture(event.pointerId);
}

function draw(event) {
  if (!drawing) {
    return;
  }

  const point = getPoint(event);
  currentStroke.push(point);

  const len = currentStroke.length;
  if (len < 2) {
    return;
  }

  setDrawingStyle();
  ctx.beginPath();
  ctx.moveTo(currentStroke[len - 2].x, currentStroke[len - 2].y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
}

function stopDrawing(event) {
  if (!drawing) {
    return;
  }

  drawing = false;
  if (currentStroke.length > 0) {
    strokes.push(currentStroke);
  }
  currentStroke = [];
  hasSignature = strokes.length > 0;
  canvas.releasePointerCapture(event.pointerId);
}

function clearSignature() {
  strokes = [];
  currentStroke = [];
  hasSignature = false;
  redrawAllStrokes();
}

function undoSignature() {
  strokes.pop();
  redrawAllStrokes();
}

function getSignatureDataUrl() {
  const trimmed = document.createElement("canvas");
  const sourceW = canvas.clientWidth;
  const sourceH = canvas.clientHeight;
  trimmed.width = sourceW;
  trimmed.height = sourceH;

  const tctx = trimmed.getContext("2d");
  tctx.fillStyle = "#ffffff";
  tctx.fillRect(0, 0, sourceW, sourceH);
  tctx.drawImage(canvas, 0, 0, sourceW, sourceH);

  return trimmed.toDataURL("image/png");
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type || ""}`.trim();
}

function validatePhone(phone) {
  return /^[0-9+\-()\s]{6,20}$/.test(phone);
}

function formToJson(formData) {
  return {
    fullName: formData.get("fullName")?.trim(),
    phone: formData.get("phone")?.trim(),
    email: formData.get("email")?.trim(),
    signDate: formData.get("signDate"),
    agreement: formData.get("agreement")?.trim(),
    consent: formData.get("consent") === "on",
    signaturePngBase64: getSignatureDataUrl(),
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };
}

function validateForm(data) {
  if (!data.fullName || data.fullName.length < 2) {
    return "Please enter a valid name.";
  }

  if (!validatePhone(data.phone || "")) {
    return "Please enter a valid phone number.";
  }

  if (!data.email || !/.+@.+\..+/.test(data.email)) {
    return "Please enter a valid email address.";
  }

  if (!data.signDate) {
    return "Please choose a date.";
  }

  if (!data.agreement || data.agreement.length < 8) {
    return "Agreement text is too short.";
  }

  if (!data.consent) {
    return "Please accept the consent checkbox.";
  }

  if (!hasSignature) {
    return "Please provide your handwritten signature.";
  }

  return "";
}

async function copyJsonToClipboard() {
  const text = outputBox.textContent;
  if (!text || text === "No submission yet.") {
    setStatus("Nothing to copy yet.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("JSON copied to clipboard.", "success");
  } catch {
    setStatus("Clipboard permission denied. Please copy manually.", "error");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus("", "");

  const data = formToJson(new FormData(form));
  const error = validateForm(data);
  if (error) {
    setStatus(error, "error");
    return;
  }

  outputBox.textContent = JSON.stringify(data, null, 2);
  setStatus("Form submitted in demo mode. JSON generated.", "success");
});

copyJsonBtn.addEventListener("click", copyJsonToClipboard);
clearBtn.addEventListener("click", clearSignature);
undoBtn.addEventListener("click", undoSignature);

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", () => {
  setTimeout(resizeCanvas, 120);
});

const dateInput = document.getElementById("signDate");
if (dateInput && !dateInput.value) {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  dateInput.value = `${d.getFullYear()}-${month}-${day}`;
}

resizeCanvas();
setStatus("Ready. Fill out the form and sign.", "");
