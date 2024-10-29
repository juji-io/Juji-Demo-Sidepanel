import React, { useState, useRef } from 'react';
import axios from 'axios';
import "./ChatComponent.css";
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { marked } from "marked";
import Popup from './ChatPopup.js';

const ChatComponent = () => {
  const [participationId, setParticipationId] = useState(null);
  const [wsClient, setWsClient] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [participationUrl, setParticipationUrl] = useState()
  const [userName, setuserName] = useState("User");
// https://staging.juji-inc.com/pre-chat/67196aae-c4b8-44d5-adbe-1f27bcf33f9b
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
        console.log('Timeout')
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 0);
  };

  const changeChat = (url, username) => {
    console.log("resetChat", url)
    setLoading(true)
    setChatMessages([])
    setParticipationUrl(url)
    setuserName(username)
    createParticipation(url, username)
      .then(chatInfo => {
        const client = new W3CWebSocket(chatInfo.websocketUrl);
        setWsClient(client);
        setParticipationId(chatInfo.participationId);

        client.onopen = () => {
          console.log('WebSocket Client Connected');
          initChat(client, chatInfo.participationId);
        };

        client.onmessage = message => {
          onMessage(message.data);
        };

        client.onerror = error => {
          console.error('WebSocket Error:', error);
        };

        client.onclose = () => {
          console.log('WebSocket Client Closed');
        };
      });
  }

  const resetChat = () => {
    console.log("resetChat", participationUrl)
    setLoading(true)
    setChatMessages([])
    createParticipation(participationUrl, userName)
      .then(chatInfo => {
        const client = new W3CWebSocket(chatInfo.websocketUrl);
        setWsClient(client);
        setParticipationId(chatInfo.participationId);

        client.onopen = () => {
          console.log('WebSocket Client Connected');
          initChat(client, chatInfo.participationId);
        };

        client.onmessage = message => {
          onMessage(message.data);
        };

        client.onerror = error => {
          console.error('WebSocket Error:', error);
        };

        client.onclose = () => {
          console.log('WebSocket Client Closed');
        };
      });
  }


  const createParticipation = async (chatbotUrl, firstName) => {
    const response = await axios.post(chatbotUrl, {'firstName': firstName });
    return response.data;
  };

  const initChat = (client, participationId) => {
    const subscriptionQuery = `
    subscription {
        chat(input: {
            participationId: "${participationId}"
        }) {
            role
            text
            type
            quickReply {
              type
              text
              options
            }
            display {
                data {
                    questions {
                        heading
                        kind
                        wording
                        choices
                    }
                }
            }
        }
    }`;
    client.send(subscriptionQuery);
  };

  const sendChatMsg = (client, participationId, userMsg) => {
    const mutationQuery = `
    mutation {
        saveChatMessage(input: {
            type: "normal"
            pid: "${participationId}"
            text: "${userMsg}"
        }) {
            success
        }
    }`
    client.send(mutationQuery);
  };

  const onMessage = (message) => {
    const parsed = JSON.parse(message);
    console.log(message)
    if (parsed.data && parsed.data.chat) {
      console.log(parsed.data.chat)
      const chatData = parsed.data.chat;
      if (chatData.display){
        console.log(chatData.display.data)
      }
      if (chatData.role === 'rep' && chatData.display && chatData.display.data && chatData.display.data.questions && chatData.display.data.questions[0]
        // && chatData.display.data.questions && chatData.display.data.questions[0]
      ){
        console.log(chatData.display.data.questions[0])
        setChatMessages(prevMessages => [...prevMessages, {
          role: "assistant",
          content: chatData.display.data.questions[0].wording,
          choices: chatData.display.data.questions[0].choices,
          type: "single-choice"
        }]);
        scrollToBottom()
        setLoading(false)
      }else if (chatData.role === 'rep') {
        setChatMessages(prevMessages => [...prevMessages, {
            role: "assistant",
            content: chatData.text,
            quickReply: chatData.quickReply,
            type: "free-text"
          }]);
          scrollToBottom()
          setLoading(false)
      }
    }
  };

  const handleSendMessage = () => {
    if (wsClient && participationId) {
        setLoading(true)
        setChatMessages(prevMessages => [...prevMessages, {
          role: "user",
          content: userMessage
        }])
      sendChatMsg(wsClient, participationId, userMessage);
      scrollToBottom()
      setUserMessage('');
    }
  };

  const handleSendMessageButton = (message) => {
    if (wsClient && participationId) {
      setLoading(true)
      sendChatMsg(wsClient, participationId, message);
      scrollToBottom()
      setUserMessage('');
    }
  };

  const quickReply = (message,message_index) => {
    let quickReplyCont = `quickreplycont-${message_index}`
    if (message.quickReply) {
      const qr = message.quickReply[0].options.map((option, index) => (
        // console.log(option)
        <div className="quick-reply-tot" key={index} onClick={(e) =>
          {e.preventDefault();
            const button = e.target;
            if (button.id === `quickreply-${index}`) {
              button.classList.toggle('quickreply-clicked');
            }
            console.log(option)
            setChatMessages(prevMessages => [...prevMessages, {
              role: "user",
              content: option
            }])
            handleSendMessageButton(option)
            const quickReplyElement = document.getElementById(quickReplyCont);
            if (quickReplyElement) {
              quickReplyElement.remove(); // This removes the element directly
            }
            }}>
          <span class="arrow"></span>
        <span className="quickreply" key={index} id={`quickreply-${index}`}
             >{option}</span>
          </div>
      ))
      return (<div id={quickReplyCont} className ="quickreply-container">{qr}</div>)
    }
  };

  const choices = (message) => {
    if (message.choices) {
      const qr = message.choices.map((choice_obj, index) => (
        <button className="choice" key={index} id={`choice-${index}`}
        onClick={(e) =>
          {e.preventDefault();
            const button = e.target;
            if (button.id === `choice-${index}`) {
              button.classList.toggle('choice-clicked');
            }
            console.log(choice_obj.text)
            setChatMessages(prevMessages => [...prevMessages, {
              role: "user",
              content: choice_obj.text
            }])
            handleSendMessageButton(choice_obj.text)
            // setUserMessage(option);
            //  handleSendMessage();
            }}
             >{choice_obj.text}</button>
      ))
      return (<div className ="choice-container">{qr}</div>)
    }
  };

  return (
    <div className="messages-container">
      <button className="change-button" onClick={(e) =>
             {setIsOpen(true)}}>
              Change
            </button>
       <button className="reset-button" onClick={(e) =>
             {resetChat()}}>
              Reset
            </button>
            {isOpen && <Popup setIsOpen={setIsOpen} 
            participationUrl={participationUrl} 
            changeChat= {changeChat}/>}
          {chatMessages.map((message, index) => (
              <div>
                <div key={index} className={`${message.role}-message-container`}>
                  {message.content && (
                      <div className={`message ${message.role}-message`}>
                        <div className = "message-title">{message.role === "assistant" ? "Juji" : userName}</div>
                          <div className = "line-1 anim-typewriter" dangerouslySetInnerHTML={{__html: marked(message.content).replace(/<p>|<\/p>/g, "")}}></div>
                      </div>
                  )}
              </div>
              {message.quickReply && quickReply(message,index)}
              {message.choices && choices(message)}
              </div>
          ))}
            {loading && <div key="loading" style={{marginTop: "10px"}} className={`message assistant-message`}>
            <div className = "message-title">Juji</div>
            <div className="loader"></div>
            </div>}
            {/* <div key="loading" className={`message assistant-message`}>
            <div className = "message-title">Juji</div>
            <div className="loader"></div>
            </div> */}
          
          <div ref={messagesEndRef} />
          <div className="input-area">
            <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    handleSendMessage();
                  e.preventDefault();
                }
              }}
              rows="3"
            />
            <button className="send-button" onClick={(e) =>
             {e.preventDefault()
                handleSendMessage()}}>
              Send
            </button>
          </div>
      </div>
  );
};

export default ChatComponent;