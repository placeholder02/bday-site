fetch("https://bday-site-l3a4z7tdl-placeholders-projects-6cfea610.vercel.app/api/rate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    rating: 5,
    notes: "تجربة مباشرة",
    secret: "mys3cret_123"
  })
}).then(r => r.json()).then(console.log)
