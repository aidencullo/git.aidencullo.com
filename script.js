function appendTextElement(tagName, text, parent) {
    const targetParent = parent || document.body;
    const element = document.createElement(tagName);
    element.textContent = text;
    targetParent.appendChild(element);
    return element;
}

const gh_events_endpoint = "https://api.github.com/users/aidencullo/events";

fetch(gh_events_endpoint)
    .then(response => response.json())
    .then(events => {
        const parent = document.body;
        appendTextElement("h1", "Aiden Cullo", parent);
        appendTextElement("h2", "GitHub", parent);
        const filteredEvents = events.filter(event => event.created_at.includes("2025-10-10"));
        appendTextElement("p", "Commits: " + filteredEvents.length);
        })
    .catch(error => {
        console.error("Error:", error);
    });