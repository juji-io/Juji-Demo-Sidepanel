import React, { useState } from 'react';
import './Popup.css';  // Make sure this path is correct based on your project structure

function Popup({setIsOpen, participationUrl, changeChat}) {
  const [inputValue, setInputValue] = useState(participationUrl);

  const handleSubmit = () => {
    console.log('Submitted Value:', inputValue);
    setTimeout(() => {
        console.log('handleSubmit')
        changeChat(inputValue)
        setIsOpen(false);
      }, 0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      <div className="popup">
      <div className="popup-heading">Change Chatbot Url</div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter text"
            className="popup-input"
          />
          <div className="popup-footer">
          <button onClick={handleSubmit} className="popup-button">
            Submit
          </button>
          <button onClick={handleClose} className="popup-button close">
            Close
          </button>
          </div>
        </div>
    </>
  );
}


export default Popup;