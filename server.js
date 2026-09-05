const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("MediKiosk");
        console.log("✅ Connected to MongoDB Atlas - Database: MediKiosk");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
    }
}

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "MediKiosk Backend is running!" });
});

// ---------------- PATIENTS ----------------

app.post("/api/patients", async (req, res) => {
    const { name, age, gender, mobile, abhaId, aadhaarId } = req.body;
    if (!name || !age || !gender || !mobile) {
        return res.status(400).json({ message: "Name, age, gender, and mobile are required" });
    }
    if (!["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({ message: "Gender must be Male, Female, or Other" });
    }
    try {
        const patient = {
            name, age, gender, mobile,
            abhaId: abhaId || null,
            aadhaarId: aadhaarId || null,
            registeredAt: new Date().toISOString()
        };
        const result = await db.collection("patients").insertOne(patient);
        res.status(201).json({ message: "Patient registered successfully", patient: { id: result.insertedId, ...patient } });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/api/patients", async (req, res) => {
    try {
        const patients = await db.collection("patients").find().toArray();
        res.json(patients.map(p => ({ id: p._id, ...p, _id: undefined })));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/api/patients/:id", async (req, res) => {
    try {
        const patient = await db.collection("patients").findOne({ _id: new ObjectId(req.params.id) });
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        res.json({ id: patient._id, ...patient, _id: undefined });
    } catch (err) {
        res.status(500).json({ message: "Invalid ID or server error", error: err.message });
    }
});

// ---------------- DOCTORS ----------------

app.post("/api/doctors", async (req, res) => {
    const {
        username, name, age, gender, mobile,
        experienceYears, qualification, regNumber,
        department, roomNo, certificateUrl
    } = req.body;
    if (!username || !name || !age || !gender || !mobile || !experienceYears || !qualification || !regNumber || !department || !roomNo) {
        return res.status(400).json({ message: "All required doctor fields must be provided" });
    }
    if (!["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({ message: "Gender must be Male, Female, or Other" });
    }
    try {
        const doctor = {
            username, name, age, gender, mobile,
            experienceYears, qualification, regNumber,
            department, roomNo,
            certificateUrl: certificateUrl || null,
            isVerified: false
        };
        const result = await db.collection("doctors").insertOne(doctor);
        res.status(201).json({ message: "Doctor registered successfully", doctor: { id: result.insertedId, ...doctor } });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/api/doctors", async (req, res) => {
    try {
        const doctors = await db.collection("doctors").find().toArray();
        res.json(doctors.map(d => ({ id: d._id, ...d, _id: undefined })));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/api/doctors/:id", async (req, res) => {
    try {
        const doctor = await db.collection("doctors").findOne({ _id: new ObjectId(req.params.id) });
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.json({ id: doctor._id, ...doctor, _id: undefined });
    } catch (err) {
        res.status(500).json({ message: "Invalid ID or server error", error: err.message });
    }
});

// ---------------- QUEUE ----------------

async function renumberQueue() {
    const items = await db.collection("queue").find().sort({ _reorderKey: 1 }).toArray();
    for (let i = 0; i < items.length; i++) {
        await db.collection("queue").updateOne(
            { _id: items[i]._id },
            { $set: { queuePosition: i + 1 } }
        );
    }
}

app.post("/api/queue", async (req, res) => {
    const {
        tokenNo, patientId, patientName, age, gender,
        chiefComplaint, priority, roomNo, doctorName,
        estimatedWaitMins, summaryId
    } = req.body;
    if (!tokenNo || !patientId || !patientName || !chiefComplaint || !priority || !roomNo || !doctorName) {
        return res.status(400).json({ message: "Missing required queue fields" });
    }
    if (!["normal", "urgent", "emergency"].includes(priority)) {
        return res.status(400).json({ message: "Priority must be normal, urgent, or emergency" });
    }
    try {
        const countResult = await db.collection("queue").countDocuments();
        const _reorderKey = priority === "emergency" ? -Date.now() : Date.now();
        const item = {
            tokenNo, patientId, patientName,
            age: age || null,
            gender: gender || null,
            chiefComplaint, priority,
            status: "waiting",
            roomNo, doctorName,
            queuePosition: countResult + 1,
            estimatedWaitMins: estimatedWaitMins || 15,
            createdAt: new Date().toLocaleTimeString(),
            summaryId: summaryId || null,
            _reorderKey
        };
        await db.collection("queue").insertOne(item);
        await renumberQueue();
        const saved = await db.collection("queue").findOne({ tokenNo });
        delete saved._reorderKey;
        const { _id, ...rest } = saved;
        res.status(201).json({ message: "Token added to queue", token: { id: _id, ...rest } });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/api/queue", async (req, res) => {
    try {
        const queue = await db.collection("queue").find().sort({ queuePosition: 1 }).toArray();
        res.json(queue.map(q => {
            const { _reorderKey, _id, ...rest } = q;
            return { id: _id, ...rest };
        }));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.put("/api/queue/:tokenNo/status", async (req, res) => {
    const { status } = req.body;
    if (!["waiting", "calling", "in_consultation", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }
    try {
        const result = await db.collection("queue").updateOne(
            { tokenNo: req.params.tokenNo },
            { $set: { status } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ message: "Token not found" });
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ---------------- SUMMARIES ----------------

app.post("/api/summaries", async (req, res) => {
    const {
        tokenNo, patientId, patientName, age, gender, mobile, abhaId,
        priority, emergencyNotice, chiefComplaint,
        hpiClinicalSummary, pastMedicalSummary, drugAllergySummary,
        familyPersonalSummary, rosSummary, ayushSummary,
        investigationSummary, patientFriendlySummary
    } = req.body;

    if (!tokenNo || !patientId || !patientName || !chiefComplaint || !hpiClinicalSummary) {
        return res.status(400).json({ message: "Missing required summary fields" });
    }

    try {
        const summary = {
            tokenNo, patientId, patientName,
            age: age || null,
            gender: gender || null,
            mobile: mobile || null,
            abhaId: abhaId || null,
            timestamp: new Date().toLocaleTimeString(),
            priority: priority || "normal",
            emergencyNotice: emergencyNotice || null,
            chiefComplaint,
            hpiClinicalSummary,
            pastMedicalSummary: pastMedicalSummary || "",
            drugAllergySummary: drugAllergySummary || "",
            familyPersonalSummary: familyPersonalSummary || "",
            rosSummary: rosSummary || "",
            ayushSummary: ayushSummary || null,
            investigationSummary: investigationSummary || {
                totalDocuments: 0,
                abnormalValues: [],
                recentDiagnoses: [],
                detectedMeds: []
            },
            patientFriendlySummary: patientFriendlySummary || {
                language: "en",
                summaryText: "",
                keyTakeaway: ""
            },
            doctorNotes: null,
            doctorApproved: false
        };

        const result = await db.collection("summaries").insertOne(summary);
        res.status(201).json({
            message: "Summary created successfully",
            summary: { id: result.insertedId, ...summary }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/api/summaries/:id", async (req, res) => {
    try {
        const summary = await db.collection("summaries").findOne({ _id: new ObjectId(req.params.id) });
        if (!summary) return res.status(404).json({ message: "Summary not found" });
        res.json({ id: summary._id, ...summary, _id: undefined });
    } catch (err) {
        res.status(500).json({ message: "Invalid ID or server error", error: err.message });
    }
});

app.put("/api/summaries/:id/approve", async (req, res) => {
    const { doctorNotes } = req.body;
    try {
        const result = await db.collection("summaries").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { doctorApproved: true, doctorNotes: doctorNotes || null } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ message: "Summary not found" });
        res.json({ message: "Summary approved" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ---------------- DOCUMENTS ----------------

app.post("/api/documents", async (req, res) => {
    const { title, type, fileUrl, previewUrl } = req.body;

    if (!title || !type || !fileUrl) {
        return res.status(400).json({ message: "Title, type, and fileUrl are required" });
    }
    if (!["Prescription", "Lab Report", "Discharge Summary", "Doctor Certificate"].includes(type)) {
        return res.status(400).json({ message: "Invalid document type" });
    }

    try {
        const document = {
            title,
            type,
            date: new Date().toISOString(),
            fileUrl,
            previewUrl: previewUrl || fileUrl,
            ocrStatus: "idle",
            extractedData: null
        };
        const result = await db.collection("documents").insertOne(document);
        res.status(201).json({
            message: "Document added successfully",
            document: { id: result.insertedId, ...document }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/api/documents", async (req, res) => {
    try {
        const documents = await db.collection("documents").find().toArray();
        res.json(documents.map(d => ({ id: d._id, ...d, _id: undefined })));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Update OCR status and extracted data once OCR processing completes
app.put("/api/documents/:id/ocr-result", async (req, res) => {
    const { ocrStatus, extractedData } = req.body;

    if (!["idle", "processing", "completed", "failed"].includes(ocrStatus)) {
        return res.status(400).json({ message: "Invalid ocrStatus value" });
    }

    try {
        const result = await db.collection("documents").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { ocrStatus, extractedData: extractedData || null } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ message: "Document not found" });
        res.json({ message: "OCR result updated" });
    } catch (err) {
        res.status(500).json({ message: "Invalid ID or server error", error: err.message });
    }
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`MediKiosk backend running on http://localhost:${PORT}`);
});
