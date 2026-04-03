import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const AiChat = () => {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 Ask me anything about your data!" },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(true);

  const username = localStorage.getItem("username"); 

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ RESIZE LOGIC
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // ✅ MAIN SEND FUNCTION
  const sendMessage = async (customPayload = {}) => {
    const questionToSend = customPayload.question || input;
    if (!questionToSend.trim()) return;

    if (!customPayload.skipUserMessage) {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: questionToSend },
      ]);
    }

    setLoading(true);

    try {
      const res = await api.post("/api/ai/chat", {
  question: questionToSend,
  username: username, // 🔥 ADD THIS
  page: window.location.pathname,
  needExcel: customPayload.needExcel || false,
});

      // ✅ TEXT RESPONSE
      if (res.data.response) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: res.data.response },
        ]);
      }

      // ✅ TABLE RESPONSE
      else if (Array.isArray(res.data)) {
        if (res.data.length <= 1) {
          const formatted = res.data
            .map((row) =>
              Object.entries(row)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" | ")
            )
            .join("\n");

          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: formatted || "No data found." },
          ]);
        } else {
          // ✅ ASK FIRST (NO AUTO TABLE)
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              type: "choice",
              question: questionToSend,
              data: res.data,
              showTable: false, // ✅ IMPORTANT
            },
          ]);
        }
      }

      // ✅ EXCEL RESPONSE
      else if (res.data.fileUrl) {
        window.open(res.data.fileUrl, "_blank");

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "📥 Your Excel file is ready!" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error fetching response 😅" },
      ]);
    }

    setLoading(false);
    setInput("");
  };

  return (
    <>
      {/* ========= TAB ========= */}
      {!open && (
        <div
          onClick={() => {
            setOpen(true);
            setHasNew(false);
          }}
          className="position-fixed bg-primary text-white fw-semibold shadow"
          style={{
            right: 0,
            top: "40%",
            transform: "translateY(-50%)",
            padding: "12px 6px",
            borderRadius: "10px 0 0 10px",
            cursor: "pointer",
            writingMode: "vertical-rl",
            zIndex: 1050,
          }}
        >
          🤖 AI CHAT
          {hasNew && (
            <span
              className="badge bg-danger"
              style={{
                position: "absolute",
                top: "5px",
                left: "-5px",
                fontSize: "10px",
              }}
            >
              1
            </span>
          )}
        </div>
      )}

      {/* ========= PANEL ========= */}
      <div
        className="position-fixed bg-white shadow d-flex flex-column"
        style={{
          top: 0,
          right: open ? 0 : `-${width}px`,
          width: `${width}px`,
          height: "100%",
          transition: "right 0.3s ease",
          zIndex: 1050,
        }}
      >
        {/* RESIZE HANDLE */}
        <div
          onMouseDown={() => setIsResizing(true)}
          style={{
            width: "5px",
            cursor: "col-resize",
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            background: "#dee2e6",
          }}
        />

        {/* HEADER */}
        <div className="bg-primary text-white p-3 d-flex justify-content-between">
          <strong>AI Assistant 🤖</strong>
          <button
            className="btn btn-sm btn-light"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <div key={i} className="mb-2">

              {/* NORMAL */}
              {msg.type !== "choice" && (
                <div
                  className={`d-flex ${
                    msg.sender === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <span
                    className={`px-3 py-2 rounded ${
                      msg.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-light border"
                    }`}
                    style={{ maxWidth: "80%" }}
                  >
                    {msg.text}
                  </span>
                </div>
              )}

              {/* CHOICE */}
              {msg.type === "choice" && (
                <div className="border rounded p-2 bg-light">
                  <p className="fw-semibold mb-1">
                    📊 I found multiple records. What would you like?
                  </p>

                  <div className="d-flex gap-2 mb-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setMessages((prev) =>
                          prev.map((m, index) =>
                            index === i
                              ? { ...m, showTable: !m.showTable } // ✅ TOGGLE
                              : m
                          )
                        )
                      }
                    >
                      {msg.showTable ? "Hide Data" : "View Data"}
                    </button>

                    <button
                      className="btn btn-sm btn-success"
                      onClick={() =>
                        sendMessage({
                          question: msg.question,
                          needExcel: true,
                          skipUserMessage: true,
                        })
                      }
                    >
                      Get Excel
                    </button>
                  </div>

                  {/* ✅ TABLE TOGGLE */}
                  {msg.showTable && (
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            {Object.keys(msg.data[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.data.map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((val, j) => (
                                <td key={j}>{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}

          {loading && <p className="text-muted small">Thinking...</p>}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-2 border-top d-flex gap-2">
          <input
            className="form-control form-control-sm"
            value={input}
            placeholder="Ask something..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => sendMessage()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default AiChat;
