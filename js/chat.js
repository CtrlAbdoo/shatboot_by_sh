/****
 * مساعد أكاديمية الشروق - Chatbot
 * 
 * This script manages the frontend logic for the Al Shorouk Academy chatbot,
 * including UI interactions, API communication, and conversation management.
 */

// DOM Elements: Centralized access to all necessary HTML elements.
const DOM = {
    sidebar: document.getElementById("sidebar"),
    toggleSidebarBtn: document.getElementById("toggleSidebar"),
    rightSidebar: document.getElementById("rightSidebar"),
    toggleRightSidebarBtn: document.getElementById("toggleRightSidebar"),
    overlay: document.getElementById("overlay"),
    chatInput: document.getElementById("chatInput"),
    sendButton: document.getElementById("sendButton"),
    refreshButton: document.getElementById("refreshButton"),
    chatMessages: document.getElementById("chatMessages"),
    suggestedPrompts: document.getElementById("suggestedPrompts"),
    typingIndicator: document.getElementById("typingIndicator"),
    previousChats: document.getElementById("previousChats"),
    newChatButton: document.getElementById("newChatButton"),
    mainContent: document.getElementById("mainContent"),
    welcomeMessage: document.getElementById("welcomeMessage"),
    themeToggle: document.getElementById("themeToggle"),
    // Modal elements for delete confirmation
    deleteConfirmModal: document.getElementById("deleteConfirmModal"),
    confirmDeleteButton: document.getElementById("confirmDeleteButton"),
    cancelDeleteButton: document.getElementById("cancelDeleteButton")
};

// Application State: Manages the dynamic state of the chatbot application.
const AppState = {
    userId: localStorage.getItem("userEmail") || `guest_${Math.random().toString(36).substr(2, 9)}`, // Use email if logged in, else guest ID
    currentConversationId: `conv_${Math.random().toString(36).substr(2, 9)}`,
    conversations: {},
    currentMessages: [],
    isBotTyping: false,
    sidebarOpen: false,
    rightSidebarOpen: false,
    conversationStarted: false,
    darkMode: localStorage.getItem("darkMode") === "true",
    API_URL: "https://sha-bot.onrender.com/chat",
    authToken: localStorage.getItem("token") // Load auth token from localStorage
};

/**
 * Initializes the application by setting up event listeners, loading data,
 * and preparing the UI.
 */
function initApp() {
    setupEventListeners();
    loadConversations(); // Load conversations for the current userId
    checkDarkMode();
    setupSuggestedPrompts();
    if (Object.keys(AppState.conversations).length === 0 && AppState.userId.startsWith("guest")) {
        // Add sample conversations only for guest users if no conversations exist
        addSampleConversations();
    }
    updateThemeToggleText(); // Ensure theme toggle text is correct on load
}

/**
 * Sets up all necessary event listeners for UI elements.
 */
function setupEventListeners() {
    if (DOM.toggleSidebarBtn) DOM.toggleSidebarBtn.addEventListener("click", toggleSidebar);
    if (DOM.toggleRightSidebarBtn) DOM.toggleRightSidebarBtn.addEventListener("click", toggleRightSidebar);
    if (DOM.overlay) DOM.overlay.addEventListener("click", closeSidebars);
    if (DOM.sendButton) DOM.sendButton.addEventListener("click", sendMessage);
    if (DOM.refreshButton) DOM.refreshButton.addEventListener("click", clearInput);
    if (DOM.newChatButton) DOM.newChatButton.addEventListener("click", startNewChat);
    if (DOM.themeToggle) DOM.themeToggle.addEventListener("click", toggleDarkMode);

    if (DOM.chatInput) {
        DOM.chatInput.addEventListener("input", adjustChatInputHeight);
        DOM.chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Delete confirmation modal listeners
    if (DOM.confirmDeleteButton) DOM.confirmDeleteButton.addEventListener("click", () => {
        if (conversationToDelete) {
            actuallyDeleteConversation(conversationToDelete);
        }
    });
    if (DOM.cancelDeleteButton) DOM.cancelDeleteButton.addEventListener("click", () => {
        if (DOM.deleteConfirmModal) DOM.deleteConfirmModal.style.display = "none";
        conversationToDelete = null;
    });

    window.addEventListener("resize", handleResize);
}

/**
 * Adjusts the height of the chat input textarea dynamically based on content.
 */
function adjustChatInputHeight() {
    if (!DOM.chatInput) return;
    DOM.chatInput.style.height = "auto";
    DOM.chatInput.style.height = `${Math.min(DOM.chatInput.scrollHeight, 100)}px`; // Max height 100px
}

/**
 * Toggles dark mode for the application.
 */
function toggleDarkMode() {
    AppState.darkMode = !AppState.darkMode;
    document.body.classList.toggle("dark-mode", AppState.darkMode);
    localStorage.setItem("darkMode", AppState.darkMode);
    updateThemeToggleText();
}

/**
 * Updates the text and icon of the theme toggle button based on the current mode.
 */
function updateThemeToggleText() {
    if (!DOM.themeToggle) return;
    const themeIcon = DOM.themeToggle.querySelector("i");
    const themeText = DOM.themeToggle.querySelector("span");
    if (!themeIcon || !themeText) return;

    if (AppState.darkMode) {
        themeIcon.className = "fas fa-sun";
        themeText.textContent = "الوضع الفاتح";
    } else {
        themeIcon.className = "fas fa-moon";
        themeText.textContent = "الوضع الداكن";
    }
}

/**
 * Checks and applies dark mode based on localStorage preference.
 */
function checkDarkMode() {
    if (AppState.darkMode) {
        document.body.classList.add("dark-mode");
    }
    updateThemeToggleText();
}

/**
 * Adds sample conversations to illustrate chatbot functionality, primarily for new guest users.
 */
function addSampleConversations() {
    const sampleConv1 = `conv_sample1_${AppState.userId}`;
    const sampleConv2 = `conv_sample2_${AppState.userId}`;
    AppState.conversations[sampleConv1] = {
        title: "ما هي مواد علوم حاسب؟",
        messages: [
            { messageId: `msg_${Math.random().toString(36).substr(2, 9)}`, sender: "user", text: "ما هي مواد علوم حاسب؟", timestamp: new Date().toISOString() },
            { messageId: `msg_${Math.random().toString(36).substr(2, 9)}`, sender: "bot", text: "تشمل مواد علوم الحاسب: البرمجة، هياكل البيانات، قواعد البيانات، شبكات الحاسب، نظم التشغيل، هندسة البرمجيات، الذكاء الاصطناعي، وأمن المعلومات.", timestamp: new Date().toISOString() }
        ],
        timestamp: new Date().toISOString(),
    };
    AppState.conversations[sampleConv2] = {
        title: "كيفية التحويل إلى أكاديمية الشروق",
        messages: [
            { messageId: `msg_${Math.random().toString(36).substr(2, 9)}`, sender: "user", text: "كيفية التحويل إلى أكاديمية الشروق والأوراق المطلوبة؟", timestamp: new Date().toISOString() },
            { messageId: `msg_${Math.random().toString(36).substr(2, 9)}`, sender: "bot", text: "للتحويل إلى أكاديمية الشروق تحتاج إلى: شهادة الثانوية العامة، صورة من بطاقة الرقم القومي، صور شخصية، وملء استمارة التحويل. يمكنك زيارة مكتب القبول بالأكاديمية للمزيد من المعلومات.", timestamp: new Date().toISOString() }
        ],
        timestamp: new Date().toISOString(),
    };
    saveConversations();
    updateConversationsList();
}

/**
 * Toggles the visibility of the left sidebar.
 */
function toggleSidebar() {
    if (!DOM.sidebar || !DOM.mainContent || !DOM.overlay) return;
    AppState.sidebarOpen = !AppState.sidebarOpen;
    DOM.sidebar.classList.toggle("open", AppState.sidebarOpen);
    DOM.mainContent.classList.toggle("sidebar-open", AppState.sidebarOpen);
    DOM.overlay.classList.toggle("active", AppState.sidebarOpen || AppState.rightSidebarOpen);
    if (AppState.sidebarOpen && AppState.rightSidebarOpen) {
        closeRightSidebar(); // Close right if left is opening
    }
}

/**
 * Toggles the visibility of the right sidebar.
 */
function toggleRightSidebar() {
    if (!DOM.rightSidebar || !DOM.mainContent || !DOM.overlay) return;
    AppState.rightSidebarOpen = !AppState.rightSidebarOpen;
    DOM.rightSidebar.classList.toggle("open", AppState.rightSidebarOpen);
    DOM.mainContent.classList.toggle("right-sidebar-open", AppState.rightSidebarOpen);
    DOM.overlay.classList.toggle("active", AppState.sidebarOpen || AppState.rightSidebarOpen);
    if (AppState.rightSidebarOpen && AppState.sidebarOpen) {
        closeSidebar(); // Close left if right is opening
    }
}

/**
 * Closes the left sidebar.
 */
function closeSidebar() {
    if (!DOM.sidebar || !DOM.mainContent || !DOM.overlay) return;
    AppState.sidebarOpen = false;
    DOM.sidebar.classList.remove("open");
    DOM.mainContent.classList.remove("sidebar-open");
    if (!AppState.rightSidebarOpen) DOM.overlay.classList.remove("active");
}

/**
 * Closes the right sidebar.
 */
function closeRightSidebar() {
    if (!DOM.rightSidebar || !DOM.mainContent || !DOM.overlay) return;
    AppState.rightSidebarOpen = false;
    DOM.rightSidebar.classList.remove("open");
    DOM.mainContent.classList.remove("right-sidebar-open");
    if (!AppState.sidebarOpen) DOM.overlay.classList.remove("active");
}

/**
 * Closes both sidebars.
 */
function closeSidebars() {
    closeSidebar();
    closeRightSidebar();
}

/**
 * Sets up event listeners for suggested prompt buttons.
 */
function setupSuggestedPrompts() {
    if (!DOM.suggestedPrompts || !DOM.chatInput) return;
    const promptButtons = DOM.suggestedPrompts.querySelectorAll(".prompt-button");
    promptButtons.forEach((button) => {
        button.addEventListener("click", () => {
            DOM.chatInput.value = button.textContent.trim();
            DOM.chatInput.focus();
            adjustChatInputHeight();
            // Optionally send message directly or wait for user to press send
            // sendMessage(); 
        });
    });
}

/**
 * Sends the user's message to the backend API and displays the response.
 */
async function sendMessage() {
    if (!DOM.chatInput || AppState.isBotTyping) return;
    const messageText = DOM.chatInput.value.trim();
    if (!messageText) return;

    if (!AppState.conversationStarted) startConversation();

    const messageId = `msg_${Math.random().toString(36).substr(2, 9)}`;
    const userMessage = { messageId, sender: "user", text: messageText, timestamp: new Date().toISOString() };
    
    AppState.currentMessages.push(userMessage);
    addMessageToChat(userMessage);
    
    DOM.chatInput.value = "";
    adjustChatInputHeight();
    showTypingIndicator();

    try {
        const botResponse = await sendToAPI(userMessage);
        AppState.currentMessages.push(botResponse);
        addMessageToChat(botResponse);
    } catch (error) {
        console.error("API Error:", error);
        const errorMessageText = error.message.includes("Failed to fetch") ? "عذرًا، حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت." : "عذرًا، السيرفر غير متاح حاليًا. حاول مرة أخرى لاحقًا.";
        const errorMessage = { 
            messageId: `msg_error_${Math.random().toString(36).substr(2, 9)}`,
            sender: "bot", 
            text: errorMessageText,
            timestamp: new Date().toISOString() 
        };
        AppState.currentMessages.push(errorMessage);
        addMessageToChat(errorMessage);
    } finally {
        hideTypingIndicator();
        saveCurrentConversation(); // Save conversation after bot response or error
    }
}

/**
 * Initiates a conversation by hiding welcome messages and prompts.
 */
function startConversation() {
    AppState.conversationStarted = true;
    if (DOM.welcomeMessage) DOM.welcomeMessage.style.display = "none";
    hideSuggestedPrompts();
}

/**
 * Adds a message object to the chat display.
 * @param {object} message - The message object to display.
 */
function addMessageToChat(message) {
    if (!DOM.chatMessages) return;
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", message.sender === "user" ? "user-message" : "bot-message");
    messageElement.setAttribute("data-message-id", message.messageId);

    const messageTextSpan = document.createElement("span");
    messageTextSpan.classList.add("message-text");
    // Basic XSS prevention: createTextNode instead of innerHTML for message.text
    messageTextSpan.appendChild(document.createTextNode(message.text)); 
    messageElement.appendChild(messageTextSpan);

    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-icon");
    copyButton.innerHTML = 
        '<i class="fas fa-clone"></i>'; // Using FontAwesome icon
    copyButton.setAttribute("aria-label", "نسخ الرسالة");
    copyButton.title = "نسخ الرسالة";
    copyButton.addEventListener("click", () => copyMessage(message.text));
    messageElement.appendChild(copyButton);

    DOM.chatMessages.appendChild(messageElement);
    scrollToBottom();
}

/**
 * Copies the given message text to the clipboard.
 * @param {string} textToCopy - The text to copy.
 */
function copyMessage(textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Optionally, provide feedback to the user (e.g., a small toast notification)
        console.log("Message copied to clipboard.");
    }).catch(err => {
        console.error("Failed to copy message:", err);
    });
}

/**
 * Shows the typing indicator.
 */
function showTypingIndicator() {
    AppState.isBotTyping = true;
    if (DOM.typingIndicator) DOM.typingIndicator.style.display = "flex";
    scrollToBottom();
}

/**
 * Hides the typing indicator.
 */
function hideTypingIndicator() {
    AppState.isBotTyping = false;
    if (DOM.typingIndicator) DOM.typingIndicator.style.display = "none";
}

/**
 * Sends a message to the backend API.
 * Includes Authorization token if available.
 * @param {object} userMessage - The user's message object.
 * @returns {Promise<object>} The bot's response message object.
 */
async function sendToAPI(userMessage) {
    const headers = { "Content-Type": "application/json" };
    if (AppState.authToken) {
        headers["Authorization"] = `Bearer ${AppState.authToken}`;
    }

    const response = await fetch(AppState.API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            // Backend expects `message`, not `text` for the user's input
            userId: AppState.userId, // Send userId (guest or logged-in email)
            conversationId: AppState.currentConversationId,
            messageId: userMessage.messageId,
            message: userMessage.text, // Ensure this matches backend expectation
            timestamp: userMessage.timestamp
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    // Ensure the response structure matches what the frontend expects
    return { 
        messageId: data.messageId || `msg_bot_${Math.random().toString(36).substr(2, 9)}`, // Use backend messageId if provided
        sender: "bot", 
        text: data.response, // Assuming backend sends response in `data.response`
        timestamp: new Date().toISOString() 
    };
}

/**
 * Saves the current conversation to AppState and localStorage.
 */
function saveCurrentConversation() {
    if (AppState.currentMessages.length > 0) {
        const firstUserMessage = AppState.currentMessages.find(msg => msg.sender === "user");
        const title = firstUserMessage ? firstUserMessage.text : "محادثة جديدة";
        
        AppState.conversations[AppState.currentConversationId] = {
            title: title.length > 35 ? title.substring(0, 32) + "..." : title, // Slightly shorter title
            messages: [...AppState.currentMessages],
            timestamp: new Date().toISOString()
        };
        saveConversations(); // Persist to localStorage
        updateConversationsList(); // Update UI
    }
}

/**
 * Persists all conversations to localStorage, associated with the userId.
 */
function saveConversations() {
    // Only save if not a guest user OR if guest user and explicit save is desired (current setup saves for guests too)
    // For this project, we save for guests locally, but they won't be synced if they clear cache or use another browser.
    localStorage.setItem(`conversations_${AppState.userId}`, JSON.stringify(AppState.conversations));
}

/**
 * Loads conversations from localStorage for the current userId.
 */
function loadConversations() {
    const savedConversations = localStorage.getItem(`conversations_${AppState.userId}`);
    if (savedConversations) {
        AppState.conversations = JSON.parse(savedConversations);
    } else {
        AppState.conversations = {}; // Initialize if nothing is saved
    }
    updateConversationsList();
}

/**
 * Updates the list of previous conversations in the sidebar.
 */
function updateConversationsList() {
    if (!DOM.previousChats) return;
    DOM.previousChats.innerHTML = ""; // Clear existing list items

    const sortedConversations = Object.entries(AppState.conversations)
        .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp)); // Sort by most recent

    if (sortedConversations.length === 0) {
        const noChatsElement = document.createElement("p");
        noChatsElement.textContent = "لا توجد محادثات سابقة.";
        noChatsElement.style.textAlign = "center";
        noChatsElement.style.padding = "10px";
        DOM.previousChats.appendChild(noChatsElement);
        return;
    }

    sortedConversations.forEach(([id, conversation]) => {
        const chatItem = document.createElement("div");
        chatItem.classList.add("chat-item");
        chatItem.setAttribute("data-conversation-id", id);
        if (id === AppState.currentConversationId) {
            chatItem.classList.add("active");
        }

        const chatText = document.createElement("span");
        chatText.textContent = conversation.title;
        chatItem.appendChild(chatText);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-chat");
        deleteButton.innerHTML = 
            '<i class="fas fa-trash"></i>';
        deleteButton.setAttribute("aria-label", "حذف المحادثة");
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent chatItem click event
            deleteConversation(id);
        });
        chatItem.appendChild(deleteButton);

        chatItem.addEventListener("click", () => loadConversation(id));
        DOM.previousChats.appendChild(chatItem);
    });
}


let conversationToDelete = null; // Store ID of conversation marked for deletion

/**
 * Displays a confirmation modal before deleting a conversation.
 * @param {string} conversationId - The ID of the conversation to delete.
 */
function deleteConversation(conversationId) {
    conversationToDelete = conversationId;
    if (DOM.deleteConfirmModal) {
        DOM.deleteConfirmModal.style.display = "flex"; // Show modal
        if (DOM.confirmDeleteButton) DOM.confirmDeleteButton.focus();
    }
}

/**
 * Actually deletes the conversation after confirmation.
 * @param {string} conversationId - The ID of the conversation to delete.
 */
function actuallyDeleteConversation(conversationId) {
    if (AppState.conversations[conversationId]) {
        delete AppState.conversations[conversationId];
        saveConversations();
        updateConversationsList();
        if (AppState.currentConversationId === conversationId) {
            // If current chat is deleted, start a new one or load another
            startNewChat(); 
        }
    }
    if (DOM.deleteConfirmModal) DOM.deleteConfirmModal.style.display = "none"; // Hide modal
    conversationToDelete = null;
}


/**
 * Loads a selected conversation into the main chat window.
 * @param {string} conversationId - The ID of the conversation to load.
 */
function loadConversation(conversationId) {
    if (AppState.conversations[conversationId]) {
        saveCurrentConversation(); // Save any unsaved messages from the current chat before switching
        
        AppState.currentConversationId = conversationId;
        AppState.currentMessages = [...AppState.conversations[conversationId].messages];
        
        if (DOM.chatMessages) DOM.chatMessages.innerHTML = ""; // Clear current messages display
        if (DOM.welcomeMessage) DOM.welcomeMessage.style.display = "none";
        hideSuggestedPrompts();
        AppState.conversationStarted = true;
        
        AppState.currentMessages.forEach((message) => addMessageToChat(message));
        updateConversationsList(); // To highlight the active conversation
        
        if (isMobile()) closeSidebars(); // Close sidebar on mobile after selection
    }
}

/**
 * Hides the suggested prompts section.
 */
function hideSuggestedPrompts() {
    if (DOM.suggestedPrompts) DOM.suggestedPrompts.style.display = "none";
}

/**
 * Shows the suggested prompts section.
 */
function showSuggestedPrompts() {
    if (DOM.suggestedPrompts) DOM.suggestedPrompts.style.display = "flex"; // Or 'block' depending on CSS
}

/**
 * Clears the chat input field.
 */
function clearInput() {
    if (DOM.chatInput) {
        DOM.chatInput.value = "";
        adjustChatInputHeight();
        DOM.chatInput.focus();
    }
}

/**
 * Starts a new chat session.
 */
function startNewChat() {
    saveCurrentConversation(); // Save the old one first
    
    resetChatUI(); // Clear messages from display, show welcome/prompts
    AppState.currentConversationId = `conv_${Math.random().toString(36).substr(2, 9)}_${AppState.userId}`;
    AppState.currentMessages = [];
    // AppState.conversations[AppState.currentConversationId] = { title: "محادثة جديدة", messages: [], timestamp: new Date().toISOString() }; // Pre-add to conversations
    updateConversationsList(); // Highlight new chat (or lack thereof until first message)
    if (isMobile()) closeSidebars();
}

/**
 * Resets the chat UI to its initial state (e.g., for a new chat).
 */
function resetChatUI() {
    if (DOM.chatMessages) DOM.chatMessages.innerHTML = "";
    AppState.conversationStarted = false;
    if (DOM.welcomeMessage) DOM.welcomeMessage.style.display = "block"; // Or flex, depending on CSS
    showSuggestedPrompts();
    clearInput();
}

/**
 * Scrolls the chat messages area to the bottom.
 */
function scrollToBottom() {
    if (DOM.chatMessages) DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

/**
 * Handles window resize events, primarily for responsive sidebar behavior.
 */
function handleResize() {
    if (window.innerWidth > 768) { // Arbitrary breakpoint, adjust as per CSS
        // If screen is larger, ensure sidebars don't cause overlay issues if they were left open
        if (AppState.sidebarOpen && DOM.overlay) DOM.overlay.classList.remove("active");
        if (AppState.rightSidebarOpen && DOM.overlay) DOM.overlay.classList.remove("active");
    } else {
        // On smaller screens, if a sidebar is open, the overlay should be active
        if ((AppState.sidebarOpen || AppState.rightSidebarOpen) && DOM.overlay) {
            DOM.overlay.classList.add("active");
        }
    }
}

/**
 * Checks if the current view is considered mobile (e.g., for auto-closing sidebars).
 * @returns {boolean} True if the window width is below a certain threshold.
 */
function isMobile() {
    return window.innerWidth < 769; // Example breakpoint
}

// Initialize the application when the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", initApp);

// هنا الحاجات الخاصه ب المودالز وكدا 


//  الدالة دي بتفتح المودال الخاص بالتعليقات.

const openFeedbackModal = document.getElementById("openFeedbackModal");

//  الدالة دي بتخلي المستخدم يكتب تعليقات على التطبيق.
const feedbackModal = document.getElementById("feedbackModal");

const closeFeedbackModal = document.getElementById("closeFeedbackModal");
const submitFeedback = document.getElementById("submitFeedback"); 
const feedbackInput = document.getElementById("feedbackInput");
const thankYouModal = document.getElementById("thankYouModal");
//  الدالة دي بتخلي المستخدم يشوف رسالة شكر بعد ما يبعت التعليق.
const closeThankYouModal = document.getElementById("closeThankYouModal");
// الدالة دي بتخلي المستخدم يشوف رسالة تحذير لو مفيش تعليق مكتوب.
const warningModal = document.getElementById("warningModal");
const closeWarningModal = document.getElementById("closeWarningModal");
const likeModal = document.getElementById("likeModal");
const closeLikeModal = document.getElementById("closeLikeModal");
const dislikeModal = document.getElementById("dislikeModal");
const closeDislikeModal = document.getElementById("closeDislikeModal");
// الدالة دي بتخلي المستخدم يشوف رسالة تأكيد قبل ما يحذف المحادثة.
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const closeDeleteConfirmModal = document.getElementById("closeDeleteConfirmModal");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");
const likeButton = document.getElementById("likeButton");
const dislikeButton = document.getElementById("dislikeButton");

//  الدالة دي بتفتح المودال الخاص بالتعليقات. 
openFeedbackModal.addEventListener("click", (e) => {
  feedbackModal.style.display = "flex";
  e.stopPropagation();
});
//  الدالة دي بتخلي المستخدم يكتب تعليقات على التطبيق.
closeFeedbackModal.addEventListener("click", () => {
  feedbackModal.style.display = "none";
  feedbackInput.value = "";
});
//  الدالة دي بتخلي المستخدم يشوف رسالة شكر بعد ما يبعت التعليق.
window.addEventListener("click", (e) => {
  if (e.target === feedbackModal) {
    feedbackModal.style.display = "none";
    feedbackInput.value = "";
  }
});
//  الدالة دي بتخلي المستخدم يشوف رسالة تحذير لو مفيش تعليق مكتوب.
submitFeedback.addEventListener("click", () => {
  const feedbackText = feedbackInput.value.trim();
  if (feedbackText) {
    sendFeedbackToBackend(feedbackText);
    feedbackModal.style.display = "none";
    thankYouModal.style.display = "flex";
    feedbackInput.value = "";
  } else {
    warningModal.style.display = "flex";
  }
});

closeThankYouModal.addEventListener("click", () => thankYouModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === thankYouModal) thankYouModal.style.display = "none"; });
closeWarningModal.addEventListener("click", () => warningModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === warningModal) warningModal.style.display = "none"; });
likeButton.addEventListener("click", (e) => { e.stopPropagation(); likeModal.style.display = "flex"; });
closeLikeModal.addEventListener("click", () => likeModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === likeModal) likeModal.style.display = "none"; });
dislikeButton.addEventListener("click", (e) => { e.stopPropagation(); dislikeModal.style.display = "flex"; });
closeDislikeModal.addEventListener("click", () => dislikeModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === dislikeModal) dislikeModal.style.display = "none"; });
closeDeleteConfirmModal.addEventListener("click", () => {
  deleteConfirmModal.style.display = "none";
  conversationToDelete = null;
});
window.addEventListener("click", (e) => {
  if (e.target === deleteConfirmModal) {
    deleteConfirmModal.style.display = "none";
    conversationToDelete = null;
  }
});
confirmDeleteButton.addEventListener("click", () => {
  if (conversationToDelete) {
    delete AppState.conversations[conversationToDelete];
    saveConversations();
    if (AppState.currentConversationId === conversationToDelete) startNewChat();
    else updateConversationsList();
    deleteConfirmModal.style.display = "none";
    conversationToDelete = null;
  }
});
cancelDeleteButton.addEventListener("click", () => {
  deleteConfirmModal.style.display = "none";
  conversationToDelete = null;
});
let focusedButton = confirmDeleteButton;
window.addEventListener("keydown", (e) => {
  if (deleteConfirmModal.style.display === "flex") {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      focusedButton = (focusedButton === confirmDeleteButton) ? cancelDeleteButton : confirmDeleteButton;
      focusedButton.focus();
    } else if (e.key === "Enter") {
      focusedButton.click();
    }
  }
});



// _______________________________________________________________-

//  الدالة دي بتبعت التعليق للسيرفر عشان يتخزن.
//  الدالة دي بتستخدم Fetch API عشان تبعت الطلب للسيرفر.
//  الدالة دي بتخلي المستخدم يشوف رسالة في الكونسول لو التعليق اتبعت بنجاح، أو بتظهر رسالة خطأ لو فيه مشكلة.
// مش حاطت هنا real api  > لحد ما يتعمل في الياك اند او نبقي نزود الفيتشر دي في البلان
function sendFeedbackToBackend(feedbackText) {
  const feedbackData = { feedback: feedbackText, timestamp: new Date().toISOString() };
  fetch("https://your-backend-api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedbackData),
  })
    .then(response => response.json())
    .then(data => console.log("Feedback sent successfully:", data))
    .catch(error => console.error("Error sending feedback:", error));
}
