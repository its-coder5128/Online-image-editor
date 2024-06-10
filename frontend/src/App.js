import './App.css';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import loader from './assets/loader.gif'

const api_url = process.env.REACT_APP_URL;

function App() {
  const [files, setFiles] = useState([]);
  const [actions, setActions] = useState({
    Square: false,
    sharp: 0,
    bright: 0,
    BNW: false,
    contrast: 0
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [error, setError] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading,setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
     axios.post(url, formData, config)
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error);
      });
  },[])

  function handleMultipleChange(event) {
    setError("");
    setFiles([...event.target.files]);

    const filesArray = Array.from(event.target.files);
    const imagesArray = filesArray.map(file => URL.createObjectURL(file));
    setPreviewImages(imagesArray);
  }

  function handleActionChange(event) {
    const { name, value, type, checked } = event.target;
    setActions(prevActions => ({
      ...prevActions,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  }

  function parseErrorResponse(arrayBuffer) {
    const textDecoder = new TextDecoder();
    const responseText = textDecoder.decode(arrayBuffer);
    try {
      const responseJson = JSON.parse(responseText);
      return responseJson.error || "An error occurred while uploading files.";
    } catch {
      return "An error occurred while uploading files.";
    }
  }

  function handleMultipleSubmit(event) {
    event.preventDefault();
    setShowProgressBar(true);
    setError("");
    setLoading(true);

    if (files.length === 0) {
      setError("No files selected for upload.");
      setLoading(false);
      setShowProgressBar(false);
      return;
    }

    const url = api_url;
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    Object.keys(actions).forEach(action => {
      if (action !== 'contrast' && action !== 'sharp' && action !== 'bright' && actions[action]) {
        formData.append('actions', action);
      }
    });

    if (actions.contrast > 0) {
      formData.append('actions', 'contrast');
      formData.append('contrast_value', actions.contrast);
    }
    if (actions.sharp > 0) {
      formData.append('actions', 'sharp');
      formData.append('sharp_value', actions.sharp);
    }
    if (actions.bright > 0) {
      formData.append('actions', 'bright');
      formData.append('bright_value', actions.bright);
    }

    const config = {
      responseType: 'arraybuffer',
      headers: {
        'content-type': 'multipart/form-data',
      },
      onUploadProgress: function (progressEvent) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      },
    };

    axios.post(url, formData, config)
      .then((response) => {
        var blob = new Blob([response.data], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `data.zip`);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        setShowProgressBar(false);
        setLoading(false)
        setActions({
          Square: false,
          sharp: 0,
          bright: 0,
          BNW: false,
          contrast: 0
        });
      })
      .catch((error) => {
        setShowProgressBar(false);
        if (error.response && error.response.data) {
          const errorMessage = parseErrorResponse(error.response.data);
          setError(errorMessage);
        } else {
          setError("An error occurred while uploading files.");
        }
      });
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragOver(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);

    const imagesArray = droppedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(imagesArray);
  }

  function handleDivClick() {
    inputRef.current.click();
  }

  return (
    <div className='container'>
      <div className="App">
        <form onSubmit={handleMultipleSubmit} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
          <h1>ONLINE IMAGE EDITOR</h1>
          <div onClick={handleDivClick} className={`dropzone ${dragOver ? 'dragover' : ''}`}>
            <input type="file" multiple onChange={handleMultipleChange} ref={inputRef} hidden />
            {previewImages.length > 0 ? (
              <div className='preview'>
                {previewImages.map((image, index) => (
                  <img className='prevImages' key={index} src={image} alt={`Preview ${index}`} style={{ maxWidth: '100px', margin: '5px' }} />
                ))}
              </div>
            ) : (
              <p>Drag & Drop files here or click to select</p>
            )}
          </div>
          <div>
            <div className="actions-container">
              <label>
                <input
                  type="checkbox"
                  name="Square"
                  checked={actions.Square}
                  onChange={handleActionChange}
                />
                Square
              </label>
              <label>
                <input
                  type="checkbox"
                  name="BNW"
                  checked={actions.BNW}
                  onChange={handleActionChange}
                />
                Black and White
              </label>
            </div>
            <label>
              Sharpness
              <input
                type="range"
                name="sharp"
                min="0"
                max="100"
                value={actions.sharp}
                onChange={handleActionChange}
              />
              <span>{actions.sharp}</span>
            </label>
            <label>
              Brightness
              <input
                type="range"
                name="bright"
                min="0"
                max="100"
                value={actions.bright}
                onChange={handleActionChange}
              />
              <span>{actions.bright}</span>
            </label>
            <label>
              Contrast
              <input
                type="range"
                name="contrast"
                min="0"
                max="100"
                value={actions.contrast}
                onChange={handleActionChange}
              />
              <span>{actions.contrast}</span>
            </label>
          </div>
          {loading ? 
          ( <div className='loading'>
              <span>LOADING</span>
              <img className='loader' key={new Date()} src={loader} alt="loader" style={{ maxWidth: '20px', margin: '0px'}} /> 
            </div>) : (<button type="submit">UPLOAD</button>)}
        </form>
        <div style={{ height: '10px'}}>
          {showProgressBar ? <progress value={uploadProgress} max="100"></progress> : null}
          {error && <p className='error-message'>Error uploading file: {error}</p>}
        </div>   
      </div>
    </div>
  );
}

export default App;
