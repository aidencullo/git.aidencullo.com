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
    })
    .catch(error => {
        console.error("Error:", error);
    });
