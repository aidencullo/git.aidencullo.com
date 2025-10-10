function appendTextElement(tagName, text, parent) {
    const targetParent = parent || document.body;
    const element = document.createElement(tagName);
    element.textContent = text;
    targetParent.appendChild(element);
    return element;
}

fetch("https://api.github.com/users/aidencullo")
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById("stats");
        const parent = document.body;
        appendTextElement("h1", "Aiden Cullo", parent);
        appendTextElement("h2", "GitHub", parent);
        appendTextElement("p", "Location: " + data.location, parent);
        appendTextElement("p", "Followers: " + data.followers, parent);
        appendTextElement("p", "Following: " + data.following, parent);
    })
    .catch(error => {
        console.error("Error:", error);
    });