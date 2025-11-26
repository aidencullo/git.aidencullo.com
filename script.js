const gh_events_endpoint = "https://api.github.com/users/aidencullo/events";

fetch(gh_events_endpoint)
    .then(response => response.json())
    .then(events => {
	let commits = 0
	for (const event of events) {
	    const timestamp = event.created_at
	    const date = new Date(timestamp)
	    const estDate = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
	    const now = new Date();
	    const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
	    if (estNow.toDateString() === estDate.toDateString()){
		commits++
		console.log(event.repo.name)
	    }
	}
	console.log(commits)


	const commitsDiv = document.createElement("div");
	commitsDiv.textContent = "commits: " + commits;
	document.body.appendChild(commitsDiv);


	
    })
    .catch(error => {
        console.error("Error:", error);
    });


const div = document.createElement("div");
div.textContent = "Aiden Cullo";
document.body.appendChild(div);


const dateDiv = document.createElement("div");
dateDiv.textContent = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).toDateString()
document.body.appendChild(dateDiv);

