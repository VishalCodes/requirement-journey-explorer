import React, { useState } from 'react';

function App() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState('BRD');
  const [sourceSystem, setSourceSystem] = useState('Oracle ERP');
  const [destinationSystem, setDestinationSystem] = useState('D365 F&O');
  const [file, setFile] = useState<File | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    if (!file) {
      setError('Please select a file.');
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const base64Data = e.target.result.split(',')[1];
        const fileExt = file.name.split('.').pop();

        const response = await fetch('/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputType,
            sourceSystem,
            destinationSystem,
            fileData: base64Data,
            fileExt: fileExt,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API request failed');
        }

        const data = await response.json();
        setResult(data.result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>Requirement Extractor</h1>
      <form onSubmit={handleSubmit}>
        <select value={inputType} onChange={(e) => setInputType(e.target.value)}>
          <option value="BRD">BRD</option>
          <option value="Audio">Audio</option>
          <option value="Video">Video</option> </select>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        <button type="submit">Analyze</button>
      </form>
      {loading && <p>Analyzing...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result && <pre>{result}</pre>}
    </div>
  );
}

export default App;