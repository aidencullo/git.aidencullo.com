const gh_events_endpoint = "https://api.github.com/users/aidencullo/events";

fetch(gh_events_endpoint)
    .then(response => response.json())
    .then(events => {
	console.log(events.length)
	if (events) {
	    console.log(events[0])
	}
    })
    .catch(error => {
        console.error("Error:", error);
    });
