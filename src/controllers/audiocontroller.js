import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const FLASK_API_URL = process.env.FLASK_API_URL || "http://127.0.0.1:5000"; // Default if not set

export const analyzeEmotion = async (req, res) => {
    if (!req.file) {
        console.error("❌ No audio file uploaded.");
        return res.status(400).json({ error: "No audio file uploaded" });
    }

    const filePath = req.file.path;

    try {
        console.log(`📤 Sending audio file: ${filePath} to Flask API`);

        const formData = new FormData();
        formData.append("audio", fs.createReadStream(filePath));

        // Send request to Flask API
        const response = await axios.post(`${FLASK_API_URL}/predict`, formData, {
            headers: { ...formData.getHeaders() },
        });

        console.log("✅ Flask API Response:", response.data);

        res.json(response.data);
    } catch (error) {
        console.error("❌ Error communicating with Flask API:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get emotion analysis" });
    } finally {
        // Cleanup: Ensure file is deleted after processing
        try {
            await fs.promises.unlink(filePath);
            console.log(`🗑️ Deleted uploaded file: ${filePath}`);
        } catch (err) {
            console.error("⚠️ Error deleting file:", err);
        }
    }
};
