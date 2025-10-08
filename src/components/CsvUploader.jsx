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
        // Validate rows
        const validateRows = (row, rowIndex) => {
            const errors = [];
            const { name, email, age } = row;

            if (!name) {
                errors.push(`Row ${rowIndex + 1}: 'name' cannot be empty.`);
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                errors.push(`Row ${rowIndex + 1}: 'email' is not valid.`);
            }

            if (!age || isNaN(age)) {
                errors.push(`Row ${rowIndex + 1}: 'age' must be a number.`);
            }

            return errors;
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
                    // Validates headers
                    const headerError = validateHeaders(results.meta.fields);
                    if (headerError) {
                        errors.push(headerError);
                        setValidationErrors(errors);
                        setIsValid(false);
                        setParsedData([]);
                        return;
                    }
                    // Validates each row
                    const rowErrors = results.data.flatMap(validateRows);
                    if (rowErrors.length > 0) {
                        errors.push(...rowErrors);
                        setValidationErrors(errors);
                        setIsValid(false);
                        setParsedData([]);
                    } else {
                        setValidationErrors([]);
                        setIsValid(true);
                       // setParsedData(results.data);
                    }
                },
                error: (error) => {
                    setValidationErrors(['Error parsing CSV file: ' + error.message]);
                    setIsValid(false);
                    setParsedData([]);
                }
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
        <div className="w-full max-w-4xl mx-auto p-8 text-gray-700 bg-gray-200 shadow-md rounded-md">
            <h2 className="text-lg text-center font-semibold text-gray-700 mb-3">Upload your CSV file</h2>
            <p className="mb-2">
                <span className="font-semibold text-gray-700 pl-2">Expected headers are:</span>
                <span className="text-purple-600"> name, email, and age.</span>
            </p>
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                ref={fileInput}
                className="border border-gray-300 p-2 rounded text-left w-full"
                placeholder='Choose CSV file'
            />
            
            {parsedData.length > 0 && (
                <div className="relative overflow-x-auto">
                    <h3 className="text-md text-left font-semibold text-gray-700 mb-2 mt-8 pl-4">Parsed CSV Data:</h3> {/* Display parsed data in a table */}
                        <table className="border-collapse border border-gray-700 w-full p-6 rounded-md">
                            <thead className="text-md text-left bg-gray-700 text-gray-100">
                                <tr className="px-6 py-4 border border-gray-300">
                                    {Object.keys(parsedData[0]).map((key) => (
                                    <th className="p-4" key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-md text-left bg-gray-200 text-gray-700">
                                {parsedData.map((row, index) => (
                                    <tr className="bg-grey-100 border border-gray-300"
                                        key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td className="p-4" key={i}>{value}</td>
                                    ))}
                                     </tr>
                                ))}
                            </tbody>
                        </table>
                </div>     
            )}
            {validationErrors.length > 0 && (
                <div>
                    <h4 className="text-red-600 mt-4 pl-4">Validation Errors:</h4>
                    <ul className="text-gray-700">
                        {validationErrors.map((error, index) => (
                            <li 
                                className="font-semibold pl-4" 
                                key={index}>{error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {isValid && parsedData.length > 0 && (
                <div>
                    <h4 className="text-green-600 mt-4 font-semibold pl-4">CSV data is valid!</h4>
                    {/* <pre>{JSON.stringify(parsedData, null, 2)}</pre> */}
                </div>
            )}
            {selectedFile && (
                <div className="mt-4 text-center">
                    <p className="text-md font-semibold text-gray-700 mb-2 mt-8">Selected file: </p>
                    <p className="text-purple-600 mb-8 border border-purple-600 max-w-xs mx-auto p-4 rounded">{selectedFile.name}</p>
                    <button
                        className="text-white px-4 py-2 rounded-md m-3 border items-center"
                        onClick={() => {
                            handleInitialClick();
                            handleParse();
                            setShowReset(true);
                        }}>Check CSV file
                    </button>  
                    {showReset && (
                    <button
                        className="text-white px-4 py-2 rounded-md m-3 border items-center"
                        onClick={resetUploader}
                        >Reset
                    </button>
                    )}
                </div>
            )}
        </div>
    );  
}