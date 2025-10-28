const imageInput = document.getElementById("imageInput");
const generateBtn = document.getElementById("generateBtn");
const altOutput = document.getElementById("altOutput");

generateBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Please upload an image first!");
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
          mimeType: file.type,
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

  reader.readAsDataURL(file);
});
