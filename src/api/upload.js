const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { parseLabReportTables } = require('../services/parser');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;

        // Parse the uploaded PDF for tables
        const parsedData = await parseLabReportTables(filePath);

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        res.json(parsedData);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process the file' });
    }
});

module.exports = router;
