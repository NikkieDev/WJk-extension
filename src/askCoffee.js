console.log("Asking for coffee!");

chrome.storage.sync.get(['username']).then(result => {
  if (result.username == null) {
    let username = window.prompt("Please fill in your name first!");

    if (username != null) {
      chrome.storage.sync.set({ "username": username });
    }
  } else {
    fetch("https://discord.com/api/webhooks/1176839235278491738/6sBzndskWfIWAo54tvq6N8wjhkrz0OcfP8L2h8MfK0ScfrmzxD4WyvnfJUuh37vnG6X0",
    {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ "content": `<@447111749204705294> ${result.username} wil koffie!` })
    }).catch(err => alert(`Couldn't reach SLACK api, error: ${err}`));
  }
})