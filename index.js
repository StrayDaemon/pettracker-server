import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = 5280;

// __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

// In-memory pets
let pets = [];

// Routes
app.get('/', (req, res) => res.send('Server is up and running'));

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ success: false, message: 'Missing fields' });
    } else {
        res.json({ success: true, message: 'Registration successful' });
    }
});

app.post('/pets', upload.single('image'), (req, res) => {
    const { name, breed, age } = req.body;
    if (!name || !breed || !age || !req.file) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newPet = {
        id: uuidv4(),
        name,
        breed,
        age: parseInt(age),
        photoUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    };

    pets.push(newPet);
    res.json({ success: true, message: 'Pet added successfully', pet: newPet });
});

app.get('/pets', (req, res) => res.json(pets));

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server API running on http://localhost:${PORT}`);
});
