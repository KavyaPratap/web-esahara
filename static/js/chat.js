let isChatOpen = false;
let isProcessing = false;
const quickQuestions = [
    "How does E-Sahara prevent loneliness?",
    "Is registration free for seniors?",
    "What types of activities do you offer?",
    "How to join a virtual event?",
    "Can I volunteer remotely?",
    "What devices are supported?",
    "How to update my profile?",
    "Emergency contact information"
];

async function getAIResponse(userMessage) {
    try {
        const response = await fetch('/chat', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        return (await response.json()).response || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("API error:", error);
        return "Error connecting to AI. Please try again later.";
    }
}

function toggleChat() {
    const chat = document.getElementById('chatbot-container');
    isChatOpen = !isChatOpen;
    chat.classList.toggle('chatbot-hidden');
    
    if (isChatOpen) showQuickQuestions();
}

function showQuickQuestions() {
    const questionsHTML = quickQuestions.map(q => `
        <button class="quick-question-btn" onclick="handleQuickQuestion('${q}')">
            ${q}
        </button>
    `).join('');

    const messages = document.getElementById('chat-messages');
    messages.innerHTML = `
        <div class="quick-questions">
            <div class="quick-questions-title">Common Questions:</div>
            <div class="quick-questions-grid">${questionsHTML}</div>
        </div>
    `;
}

function handleQuickQuestion(question) {
    document.querySelector('.quick-questions')?.remove();
    processMessage(question);
}

async function sendMessage() {
    if (isProcessing) return;
    
    const input = document.getElementById('user-input');
    const messages = document.getElementById('chat-messages');
    const userText = input.value.trim();
    
    if (!userText) return;
    isProcessing = true;
    input.disabled = true;
    messages.innerHTML += `<div class="message user-message">${userText}</div>`;
    input.value = '';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.textContent = '...';
    messages.appendChild(typingIndicator);
    messages.scrollTop = messages.scrollHeight;

    try {
        const aiResponse = await getAIResponse(userText);
        typingIndicator.remove();
        const responseDiv = document.createElement('div');
        responseDiv.className = 'message bot-message';
        messages.appendChild(responseDiv);
        for (let i = 0; i < aiResponse.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 35));
            responseDiv.textContent = aiResponse.substring(0, i + 1);
            messages.scrollTop = messages.scrollHeight;
        }
    } catch (error) {
        typingIndicator.remove();
        messages.innerHTML += `<div class="message bot-message">Error processing your request. Please try again.</div>`;
    } finally {
        isProcessing = false;
        input.disabled = false;
        messages.scrollTop = messages.scrollHeight;
    }
}

document.getElementById('user-input').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault();
        await sendMessage();
    }
});