const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const synth = window.speechSynthesis;
const transcriptEl = document.getElementById('transcript');

// Configuration
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;

// Conversational Database
const intelligence = {
    greetings: {
        patterns: [/hello/i, /hi/i, /hey jarvis/i],
        responses: [
            "Hello Sir! How may I assist you?", 
            "Good to hear your voice!",
            "Online and ready!"
        ]
    },
    wellbeing: {
        patterns: [/how are you/i, /haal chal/i],
        responses: [
            "All systems operational!",
            "Functioning at 100% capacity!",
            "Just another perfect day in the matrix!"
        ]
    },
    personal: {
        patterns: [/who made you/i, /your creator/i],
        responses: [
            "I was forged in the digital fires of innovation",
            "My code was crafted by visionary developers",
            "I'm a product of cutting-edge AI research"
        ]
    },
    jokes: {
        patterns: [/joke/i, /make me laugh/i],
        responses: [
            "Why do Java developers wear glasses? Because they can't C#!",
            "What do you call a fake noodle? An Impasta!",
            "Why don't scientists trust atoms? Because they make up everything!"
        ]
    }
};

// Apps Database
const apps = {
    whatsapp: {
        web: 'https://web.whatsapp.com',
        deeplink: 'whatsapp://',
        response: "Opening WhatsApp"
    },
    instagram: {
        web: 'https://instagram.com',
        deeplink: 'instagram://app',
        response: "Launching Instagram"
    },
    'google maps': {
        web: 'https://maps.google.com',
        deeplink: 'https://maps.google.com',
        response: "Opening Google Maps"
    },
    calculator: {
        web: 'calculator://',
        deeplink: 'calculator://',
        response: "Opening Calculator"
    }
};

// Initialize Assistant
window.onload = () => {
    document.getElementById('permissionHelper').click();
};

function initializeJARVIS() {
    recognition.start();
    updateStatus("Listening...");
    speak("Systems online. Ready for your commands Sir!");
}

// Speech Functions
function speak(text) {
    recognition.stop();
    transcriptEl.textContent = `JARVIS: ${text}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.onend = () => {
        recognition.start();
        updateStatus("Listening...");
    };
    synth.speak(utterance);
}

// Command Processing
recognition.onresult = (e) => {
    const command = e.results[e.resultIndex][0].transcript.toLowerCase();
    transcriptEl.textContent = `You: ${command}`;
    processCommand(command);
};

recognition.onerror = (e) => {
    updateStatus(`Error: ${e.error}`, true);
    setTimeout(() => recognition.start(), 2000);
};

function processCommand(command) {
    try {
        if(handleConversation(command)) return;
        
        switch(true) {
            case command.includes('open'):
                handleApps(command);
                break;
                
            case command.includes('time'):
                const time = new Date().toLocaleTimeString();
                speak(`Current time is ${time}`);
                break;
                
            case command.includes('date'):
                const date = new Date().toLocaleDateString();
                speak(`Today's date is ${date}`);
                break;
                
            case command.includes('navigate to'):
                const location = command.split('navigate to ')[1];
                window.open(`https://maps.google.com/maps?q=${encodeURIComponent(location)}`);
                speak(`Navigating to ${location}`);
                break;
                
            case command.includes('search'):
                const query = command.replace('search', '').trim();
                searchWeb(query);
                break;
                
            default:
                handleComplexQuery(command);
        }
    } catch(error) {
        console.error('Command Error:', error);
        speak("Sorry Sir, I encountered an error");
        updateStatus(`Error: ${error.message}`, true);
    }
}

// Advanced Functions
function handleConversation(command) {
    for(const category in intelligence) {
        if(intelligence[category].patterns.some(pattern => pattern.test(command))) {
            const response = intelligence[category].responses[
                Math.floor(Math.random() * intelligence[category].responses.length)
            ];
            speak(response);
            return true;
        }
    }
    return false;
}

function handleApps(command) {
    const appName = command.split('open ')[1].toLowerCase();
    const appData = apps[appName];

    if(appData) {
        const deeplinkWindow = window.open(appData.deeplink, '_blank');
        setTimeout(() => {
            if(deeplinkWindow.closed || deeplinkWindow.location.href === 'about:blank') {
                window.open(appData.web, '_blank');
            }
        }, 300);
        speak(appData.response);
    } else {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(appName)}`, '_blank');
        speak(`Opening ${appName} through web search`);
    }
}

function searchWeb(query) {
    window.open(`https://google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    speak(`Searching web for ${query}`);
}

function handleComplexQuery(query) {
    const responses = [
        `Analyzing: "${query}"`,
        "Processing thought pattern...",
        "Consulting knowledge base..."
    ];
    speak(responses[Math.floor(Math.random() * responses.length)]);
    setTimeout(() => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }, 3000);
}

// Helper Functions
function updateStatus(text, isError = false) {
    const statusEl = document.querySelector('.status');
    statusEl.textContent = text;
    statusEl.classList.toggle('error', isError);
}

// Microphone Permission
document.getElementById('permissionHelper').addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => {
        console.log("Mic access: Granted");
        initializeJARVIS();
    })
    .catch(() => {
        speak("Please allow microphone access to continue");
        updateStatus("Click anywhere to start", true);
        document.body.addEventListener('click', initializeJARVIS, {once: true});
    });
});
