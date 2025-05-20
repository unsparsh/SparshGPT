import { useState, useEffect, useRef } from "react";
import "./App.css";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

function App() {
  const [message, setMessage] = useState(null);
  const [value, setValue] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState("");

  const handleClick = (uniqueTitles) => {
    setCurrentTitle(uniqueTitles);
    setValue("");
    setMessage(null);
  };

  const getMesssages = async () => {
    const userMessage = value; // capture current input

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
    };

    try {
      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      const data = await response.json();
      setMessage(data.choices[0].message.content);

      // update chat history immediately
      if (!currentTitle) {
        setCurrentTitle(userMessage);
      }

      setPreviousChats((prev) => [
        ...prev,
        {
          title: currentTitle ?? userMessage,
          role: "user",
          content: userMessage,
        },
        {
          title: currentTitle ?? userMessage,
          role: "assistant",
          content: data.choices[0].message.content,
        },
      ]);

      setValue(""); // clear input only after everything's stored
    } catch (err) {
      console.error("Frontend Error:", err);
    }
  };

  useEffect(() => {
    if (!currentTitle && message && lastUserMessage) {
      setCurrentTitle(lastUserMessage);
    }

    if (currentTitle && message && lastUserMessage) {
      setPreviousChats((previousChats) => [
        ...previousChats,
        {
          title: currentTitle,
          role: "user",
          content: lastUserMessage,
        },
        {
          title: currentTitle,
          role: "assistant",
          content: message,
        },
      ]);
      setLastUserMessage(""); // clear after adding
    }
  }, [message]);

  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [previousChats]);

  const createNewChat = () => {
    setCurrentTitle(null);
    setValue("");
    setMessage(null);
  };

  const currentChat = previousChats.filter(
    (previousChats) => previousChats.title === currentTitle
  );
  const uniqueTitles = Array.from(
    new Set(previousChats.map((chat) => chat.title))
  );

  return (
    <div className="App">
      <section className="side-bar">
        <button onClick={createNewChat}>
          <FaPlus /> New chat
        </button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitles, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitles)}>
              {uniqueTitles}
            </li>
          ))}
        </ul>
        <nav>
          <p>Made By Sparsh</p>
        </nav>
      </section>

      <section className="main">
        <h1>SparshGPT</h1>
        <ul className="feed">
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
              <p className="role">{chatMessage.role}</p>
              <p className="chatMessage">{chatMessage.content}</p>
            </li>
          ))}
          <div ref={feedEndRef} />
        </ul>

        <div className="bottom-section">
          <div className="input-container">
            <input
              placeholder="Ask Anything"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // prevents accidental form submits
                  getMesssages();
                }
              }}
            />

            <div id="submit" onClick={getMesssages}>
              <FaRegArrowAltCircleUp />
            </div>
          </div>
          <p className="info">
            Chat GPT Mar 14 Version. Free Research Preview. Our goal is to make
            AI systems more natural and safe to interact with. Your feedback
            will help us improve.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
