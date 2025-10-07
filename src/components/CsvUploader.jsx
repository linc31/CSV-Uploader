import { useState, useRef } from 'react';
import Papa from "papaparse";


export default 
    function CsvUploader() {
        const [selectedFile, setSelectedFile] = useState(null);
        const [parsedData, setParsedData] = useState([]);
        const [showReset, setShowReset] = useState(false);
        const [validationErrors, setValidationErrors] = useState([]);
        const [isValid, setIsValid] = useState(false);

        const REQUIRED_HEADERS = ['name', 'email', 'age'];

        const handleFileChange = (event) => {
            setSelectedFile(event.target.files[0]);
        }

        // Validate parsed data
        const validateHeaders = (headers) => {
            const missingHeaders = REQUIRED_HEADERS.filter(
                header => !headers.includes(header)
            );
            if (missingHeaders.length > 0) {
                return 'Missing required headers: ' + missingHeaders.join(', ');
            }
        }

        // Parse CSV file
        const handleParse = () => {
            if (!selectedFile) return;

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setParsedData(results.data);
                    const errors = [];

                    const headerError = validateHeaders(results.meta.fields);
                    if (headerError) {
                        errors.push(headerError);
                        setValidationErrors(errors);
                        setIsValid(false);
                        setParsedData([]);
                        return;
                    }
                },
            });
        }
        

        // Show reset button after initial click
        const handleInitialClick = () => {
            setShowReset(true);
        }

        const fileInput = useRef(null);

        function resetUploader() {
            setSelectedFile(null);
            setParsedData([]);
            if (fileInput.current) {
                fileInput.current.value = null;
            }
            setValidationErrors([]);
            setIsValid(false);
            setShowReset(false);
        }


    return (
        <div className="w-full max-w-4xl mx-auto p-4 text-gray-700 bg-gray-100 shadow-md rounded">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Upload your CSV file</h2>
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                ref={fileInput}
                className="border border-gray-300 p-2 rounded"
            />
            
            {parsedData.length > 0 && (
                <div>
                    <h3>Parsed CSV Data:</h3> {/* Display parsed data in a table */}
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(parsedData[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>{value}</td>
                                    ))}
                                     </tr>
                                ))}
                            </tbody>
                        </table>
                </div>     
            )}
            {validationErrors.length > 0 && (
                <div style={{ color: 'red' }}>
                    <h4>Validation Errors:</h4>
                    <ul>
                        {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
            {isValid && parsedData.length > 0 && (
                <div style={{ color: 'green' }}>
                    <h4>CSV data is valid!</h4>
                    <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                </div>
            )}
            {selectedFile && (
                <>
                    <p className="text-purple-600 p-4">Selected file: {selectedFile.name}</p>
                    <button
                        className="text-white px-4 py-2 rounded-md m-3 border"
                        onClick={() => {
                            handleInitialClick();
                            handleParse();
                            setShowReset(true);
                        }}>Check CSV file
                    </button>  
                    {showReset && (
                    <button
                        className="text-white px-4 py-2 rounded-md m-3 border"
                        onClick={resetUploader}
                        >Reset
                    </button>
                    )}
                </>
            )}
        </div>
    );  
}