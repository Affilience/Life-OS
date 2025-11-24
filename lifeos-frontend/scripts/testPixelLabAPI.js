// Test PixelLab API to debug why sprite generation is failing

const API_KEY = "sk-pixellab-fca76ab2-bd66-4d73-a57a-19c1e58b5eaa";

async function testMapObjectCreation() {
  console.log("Testing PixelLab Map Object API...\n");

  const testPayload = {
    description: "simple wooden sword weapon",
    width: 64,
    height: 64,
    view: "high top-down",
    detail: "high detail",
    shading: "detailed shading",
    outline: "single color outline"
  };

  console.log("Payload:", JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch("https://api.pixellab.ai/map-objects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testPayload)
    });

    console.log("\nResponse Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("\nResponse Body:", JSON.stringify(data, null, 2));

    if (data.object_id) {
      console.log("\n✅ Success! Object ID:", data.object_id);
      console.log("Wait ~30 seconds then check status at:");
      console.log(`https://api.pixellab.ai/mcp/map-objects/${data.object_id}`);
    } else {
      console.log("\n❌ Failed to create object");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

testMapObjectCreation();
