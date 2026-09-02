const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const patients = [];

// Home / Test route
app.get("/", (req, res) => {
    res.json({
        message: "MediKiosk Backend is running!"
    });
});

// Register a new patient
app.post("/api/patients", (req, res) => {
    const { name, age, gender, mobile } = req.body;

    if (!name || !age || !gender || !mobile) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const patient = {
        id: patients.length + 1,
        name,
        age,
        gender,
        mobile
    };

    patients.push(patient);

    res.status(201).json({
        message: "Patient registered successfully",
        patient
    });
});

// Get all patients
app.get("/api/patients", (req, res) => {
    res.json(patients);
});

// Get a single patient by ID
app.get("/api/patients/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const patient = patients.find(p => p.id === id);

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found"
        });
    }

    res.json(patient);
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`MediKiosk backend running on http://localhost:${PORT}`);
});