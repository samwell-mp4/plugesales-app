// Using native fetch

async function test() {
    console.log("--- Testing GET /api/leads with role=ADMIN ---");
    try {
        const res = await fetch('http://localhost:3000/api/leads?role=ADMIN');
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Leads count:", data.length);
        if (data.length > 0) {
            console.log("Latest lead ID:", data[0].id);
        }
    } catch (err) {
        console.error("❌ Connection error:", err.message);
        console.log("Make sure 'server.js' is running in another terminal!");
    }
}

test();
