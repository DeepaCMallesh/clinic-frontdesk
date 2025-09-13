const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// --- MOCK DATABASE (IN-MEMORY ARRAYS) ---
let patients = [
    { id: '1', name: 'John Doe', status: 'Waiting', priority: 'Normal' },
    { id: '2', name: 'Jane Smith', status: 'With Doctor', priority: 'Normal' },
    { id: '3', name: 'Bob Johnson', status: 'Waiting', priority: 'Urgent' }
];

let doctors = [
    { id: 'd1', name: 'Dr. Smith', specialization: 'General Practice', status: 'Available', gender: 'Male', location: 'Clinic A' },
    { id: 'd2', name: 'Dr. Johnson', specialization: 'Pediatrics', status: 'Busy', gender: 'Female', location: 'Clinic B' },
    { id: 'd3', name: 'Dr. Lee', specialization: 'Cardiology', status: 'Off Duty', gender: 'Female', location: 'Clinic A' },
    { id: 'd4', name: 'Dr. Patel', specialization: 'Dermatology', status: 'Available', gender: 'Male', location: 'Clinic B' }
];

let appointments = [];

// --- API ENDPOINTS ---

// GET endpoint to retrieve the list of patients in the queue
app.get('/api/queue', (req, res) => {
    // Sort the patients: Urgent patients first
    const sortedPatients = patients.sort((a, b) => {
        if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
        if (a.priority !== 'Urgent' && b.priority === 'Urgent') return 1;
        return 0;
    });
    res.json(sortedPatients);
});

// GET endpoint to retrieve the list of all doctors
app.get('/api/doctors', (req, res) => {
    res.json(doctors);
});

// GET endpoint to retrieve a single doctor by ID
app.get('/api/doctors/:id', (req, res) => {
    const { id } = req.params;
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }
    res.json(doctor);
});

// POST endpoint to add a new doctor
app.post('/api/doctors', (req, res) => {
    const { name, specialization, gender, location } = req.body;
    if (!name || !specialization || !gender || !location) {
        return res.status(400).json({ error: 'All fields are required for a new doctor.' });
    }
    const newDoctor = {
        id: uuidv4(),
        name,
        specialization,
        gender,
        location,
        status: 'Available'
    };
    doctors.push(newDoctor);
    res.status(201).json(newDoctor);
});

// PUT endpoint to update a doctor's profile
app.put('/api/doctors/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const doctorIndex = doctors.findIndex(d => d.id === id);

    if (doctorIndex === -1) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }

    doctors[doctorIndex] = { ...doctors[doctorIndex], ...updateData };
    res.json(doctors[doctorIndex]);
});

// DELETE endpoint to remove a doctor
app.delete('/api/doctors/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = doctors.length;
    doctors = doctors.filter(d => d.id !== id);

    if (doctors.length === initialLength) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }

    res.status(204).send();
});

// POST endpoint to add a new patient to the queue
app.post('/api/patients', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Patient name is required.' });
    }
    const newPatient = {
        id: uuidv4(),
        name,
        status: 'Waiting',
        priority: 'Normal'
    };
    patients.push(newPatient);
    res.status(201).json(newPatient);
});

// PUT endpoint to update a patient's status or priority
app.put('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    const { status, priority } = req.body;
    const patientIndex = patients.findIndex(p => p.id === id);

    if (patientIndex === -1) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    if (status) {
        patients[patientIndex].status = status;
    }
    if (priority) {
        patients[patientIndex].priority = priority;
    }

    res.json(patients[patientIndex]);
});

// DELETE endpoint to remove a patient from the queue
app.delete('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = patients.length;
    patients = patients.filter(p => p.id !== id);

    if (patients.length === initialLength) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    res.status(204).send();
});

// GET endpoint to retrieve all appointments
app.get('/api/appointments', (req, res) => {
    res.json(appointments);
});

// POST endpoint to book a new appointment
app.post('/api/appointments', (req, res) => {
    const { patientName, doctorId, time, date } = req.body;
    if (!patientName || !doctorId || !time || !date) {
        return res.status(400).json({ error: 'All fields are required to book an appointment.' });
    }
    const newAppointment = {
        id: uuidv4(),
        patientName,
        doctorId,
        time,
        date,
        status: 'Booked'
    };
    appointments.push(newAppointment);
    res.status(201).json(newAppointment);
});

// PUT endpoint to update an appointment's status
app.put('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const appointmentIndex = appointments.findIndex(a => a.id === id);

    if (appointmentIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found.' });
    }

    appointments[appointmentIndex].status = status;
    res.json(appointments[appointmentIndex]);
});

// DELETE endpoint to cancel an appointment
app.delete('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = appointments.length;
    appointments = appointments.filter(a => a.id !== id);

    if (appointments.length === initialLength) {
        return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Backend API simulation listening at http://localhost:${port}`);
});
