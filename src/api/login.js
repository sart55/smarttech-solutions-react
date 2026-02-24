// api/login.js
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Forward request to backend
    const backendResponse = await fetch(
      "https://smarttechsolutions-backend.onrender.com/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body), // forward frontend JSON body
      }
    );

    const data = await backendResponse.json();

    // Forward backend status and data
    res.status(backendResponse.status).json(data);
  } catch (error) {
    console.error("Serverless login error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
