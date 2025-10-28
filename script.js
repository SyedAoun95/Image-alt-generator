const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const generateBtn = document.getElementById("generateBtn");
const altOutput = document.getElementById("altOutput");

let selectedFile = null;

// 🔹 Click to open file dialog
dropZone.addEventListener("click", () => imageInput.click());

// 🔹 File input change
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// 🔹 Drag & drop support
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// 🔹 Paste image support (copy + paste directly)
document.addEventListener("paste", async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        handleFile(file);

        // 🔸 Update the input so user can still generate alt text after paste
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;

        selectedFile = file;
      }
    }
  }
});

// 🔹 Preview image
function handleFile(file) {
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

// 🔹 Generate alt text (same API logic)
generateBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please upload or paste an image first!");
    return;
  }

  altOutput.textContent = "⏳ Generating alt text...";

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Image = reader.result.split(",")[1];

    try {
      const response = await fetch("http://localhost:3000/generate-alt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: base64Image,
          mimeType: selectedFile.type,
        }),
      });

      const data = await response.json();
      console.log("Client received:", data);

      altOutput.textContent = data.altText || "⚠️ No alt text generated.";
    } catch (error) {
      console.error("Error:", error);
      altOutput.textContent = "⚠️ Failed to generate alt text.";
    }
  };

  reader.readAsDataURL(selectedFile);
});
