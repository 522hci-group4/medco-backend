const fs = require('fs');
const pdf2table = require('pdf2table');

const parseLabReportTables = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, buffer) => {
            if (err) return reject(err);

            pdf2table.parse(buffer, (error, rows) => {
                if (error) return reject(error);

                // Define keywords or patterns to exclude irrelevant rows
                const excludedKeywords = [
                    'Name', 'Age', 'Gender', 'Ref', 'Registered', 'Dr', 'Report',
                    'Specimen', 'Collected', 'Department', 'Textbook', 'Edition',
                    'Patient ID', 'Barcode ID', 'Order ID', 'Tata', 'TATA', 'Sample Receive Date', 'Collection Date', "American Thyroid", "1st trimester", "2nd trimester","3rd trimester"
                ];

                const isValidRow = (row) => {
                    const [testName] = row;

                    // Exclude rows with specific keywords
                    if (excludedKeywords.some((keyword) =>
                        testName.toLowerCase().includes(keyword.toLowerCase())
                    )) {
                        return false;
                    }

                    // Exclude rows with overly short or non-descriptive test names
                    if (testName.trim().length < 3) {
                        return false;
                    }

                    // Exclude rows that do not look like valid test data
                    const hasValue = /\d/.test(row[1]); // Check if the second column has a numeric value
                    return hasValue;
                };

                // Process rows into structured test data
                const tests = rows
                    .filter((row) => row.length > 2 && isValidRow(row)) // Filter out irrelevant rows
                    .map((row) => {
                        const [testName, valueWithUnit, ...rest] = row;

                        // Split value and unit intelligently
                        const valueMatch = /([\d.]+)\s*([a-zA-Z/%]*)/.exec(valueWithUnit);
                        const value = valueMatch ? valueMatch[1] : '';
                        const unit = valueMatch ? valueMatch[2] : '';

                        // Determine the reference range and additional notes
                        let refRange = rest.join(' ').trim();
                        const refMatch = /([\d.-]+)\s*[-–]\s*([\d.]+)/.exec(refRange);
                        refRange = refMatch ? `${refMatch[1]} - ${refMatch[2]}` : refRange;

                        // Determine status (Normal, High, Low)
                        let status = 'Normal';
                       
                        if (refMatch) {
                            const low = parseFloat(refMatch[1]);
                            const high = parseFloat(refMatch[2]);
                            const numericValue = parseFloat(value);

                            if (!isNaN(low) && !isNaN(high)) {
                                if (numericValue < low) status = 'Low';
                                if (numericValue > high) status = 'High';
                            }
                            
                        }

                        return {
                            test_name: testName.trim(),
                            value: value.trim(),
                            unit: unit.trim(),
                            ref_range: refRange,
                            status,
                        };
                    });

                resolve(tests);
            });
        });
    });
};

module.exports = { parseLabReportTables };
