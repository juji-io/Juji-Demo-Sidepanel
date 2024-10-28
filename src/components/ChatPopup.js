import React, { useState } from 'react';
import './Popup.css';  // Make sure this path is correct based on your project structure

function Popup({setIsOpen, participationUrl, changeChat}) {
  const [inputValue, setInputValue] = useState();
  const [inputValue2, setInputValue2] = useState();

  const handleSubmit = () => {
    console.log('Submitted Value:', inputValue);
    setTimeout(() => {
        console.log('handleSubmit')
        changeChat(inputValue, inputValue2)
        setIsOpen(false);
      }, 0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputChange2 = (event) => {
    setInputValue2(event.target.value);
  };

  return (
    <>
      <div className="popup">
      <div className="popup-heading">Enter Chatbot Details</div>
      <div className="popup-sub-heading">Chatbot Url</div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter Url"
            className="popup-input"
          />
      <div className="popup-sub-heading">Username</div>
          <input
            type="text"
            value={inputValue2}
            onChange={handleInputChange2}
            placeholder="Enter Username"
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