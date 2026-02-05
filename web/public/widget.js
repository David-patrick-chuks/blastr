(function () {
    const script = document.getElementById('gaia-agent-widget');
    const agentId = script.getAttribute('data-agent-id');
    const backendUrl = 'https://blastr-backend.vercel.app/api'; // Updated for production

    // Create Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .gaia-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: sans-serif;
        }
        .gaia-chat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        .gaia-chat-button:hover {
            transform: scale(1.05);
        }
        .gaia-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #e4e4e7;
        }
        .gaia-chat-header {
            padding: 16px;
            background: #10b981;
            color: white;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .gaia-chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f9fafb;
        }
        .gaia-message {
            padding: 8px 12px;
            border-radius: 8px;
            max-width: 80%;
            font-size: 14px;
            line-height: 1.4;
        }
        .gaia-message.user {
            background: #10b981;
            color: white;
            align-self: flex-end;
        }
        .gaia-message.agent {
            background: #e5e7eb;
            color: #1f2937;
            align-self: flex-start;
        }
        .gaia-chat-input {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
            background: white;
        }
        .gaia-input-field {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        }
        .gaia-send-btn {
            background: none;
            border: none;
            color: #10b981;
            cursor: pointer;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    // Create Container
    const container = document.createElement('div');
    container.className = 'gaia-widget-container';

    // Chat Window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'gaia-chat-window';
    chatWindow.innerHTML = `
        <div class="gaia-chat-header">
            <span>AI Assistant</span>
            <button id="gaia-close-btn" style="background:none;border:none;color:white;cursor:pointer;">✕</button>
        </div>
        <div class="gaia-chat-messages" id="gaia-messages">
            <div class="gaia-message agent">Hello! How can I help you today?</div>
        </div>
        <div class="gaia-chat-input">
            <input type="text" class="gaia-input-field" placeholder="Type a message..." id="gaia-input" />
            <button class="gaia-send-btn" id="gaia-send">Send</button>
        </div>
    `;

    // Button
    const button = document.createElement('div');
    button.className = 'gaia-chat-button';
    button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

    container.appendChild(chatWindow);
    container.appendChild(button);
    document.body.appendChild(container);

    // Logic
    let isOpen = false;
    const messagesContainer = chatWindow.querySelector('#gaia-messages');
    const input = chatWindow.querySelector('#gaia-input');
    const sendBtn = chatWindow.querySelector('#gaia-send');
    const closeBtn = chatWindow.querySelector('#gaia-close-btn');

    button.onclick = () => toggleChat(true);
    closeBtn.onclick = () => toggleChat(false);

    function toggleChat(state) {
        isOpen = state;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        button.style.display = isOpen ? 'none' : 'flex';
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        try {
            // Add loading state if you want
            const response = await fetch(`${backendUrl}/chat`, { // Direct chat endpoint or specific widget endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: agentId,
                    message: text,
                    // history: [] // could maintain history in local variable
                })
            });

            const data = await response.json();
            addMessage(data.text || "Sorry, I couldn't process that.", 'agent');
        } catch (e) {
            addMessage("Error connecting to agent.", 'agent');
        }
    }

    function addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `gaia-message ${type}`;
        msg.textContent = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

})();
