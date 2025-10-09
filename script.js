async function main() {
    // Get repos
    const repos = await fetch("https://api.github.com/users/aidencullo/repos").then(r => r.json());
    
    // Get commits for each repo
    for (const repo of repos) {
        const commits = await fetch(`https://api.github.com/repos/aidencullo/${repo.name}/commits`).then(r => r.json());
        const child = document.createElement("p");
        child.textContent = `${repo.name}: ${commits.length}`;
        document.body.appendChild(child);
        console.log(repo.name, commits);
    }
}
main();

const data = fetch("https://api.github.com/users/aidencullo")
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById("stats");
        const parent = document.body;
        const child1 = document.createElement("h1");
        child1.textContent = "Aiden Cullo";
        parent.appendChild(child1);
        
        const child2 = document.createElement("h2");
        child2.textContent = "GitHub";
        parent.appendChild(child2);
        
        const child3 = document.createElement("p");
        child3.textContent = "Location: " + data.location;
        parent.appendChild(child3);
        
        const child4 = document.createElement("p");
        child4.textContent = "Followers: " + data.followers;
        parent.appendChild(child4);
        
        const child5 = document.createElement("p");
        child5.textContent = "Following: " + data.following;
        parent.appendChild(child5);
    })
    .catch(error => {
        console.error("Error:", error);
    });
