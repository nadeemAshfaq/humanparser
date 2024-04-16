const express = require("express");
const app = express();
const http = require("http");
var cors = require("cors");
const human = require("humanparser");

app.use(cors());

// Define the starting port number
let port = process.env.PORT || 8000;

// Create a server instance
const server = http.createServer(app);

// Define a function to start the server
const startServer = () => {
  server.listen(port, () => {
    console.log(`Server listening on port ${server.address().port}`);
  });
};

// Attempt to start the server
startServer();

// Handle case where port is already in use
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.warn(`Port ${port} is already in use, trying another port...`);
    // Try the next port
    port++;
    startServer();
  } else {
    console.error("Server could not start:", error);
  }
});
/////////////////////////////////////////////////////////////////////////////

app.get("/parseHumanData", (req, res) => {
  const data = req.query.data;

  if (!data) {
    return res.status(400).json({ message: "Invalid data provided" });
  }

  const result = {};

  // Parse human name
  if (data.includes("fullName")) {
    const fullName = req.query.fullName;
    if (!fullName) {
      return res.status(400).json({ message: "Invalid full name provided" });
    }
    result.name = human.parseName(fullName);
  }

  // Get the fullest name in a string
  if (data.includes("name")) {
    const name = req.query.name;
    if (!name) {
      return res.status(400).json({ message: "Invalid name provided" });
    }
    result.fullestName = human.getFullestName(name);
  }

  // Parse address
  if (data.includes("address")) {
    const address = req.query.address;
    if (!address) {
      return res.status(400).json({ message: "Invalid address provided" });
    }
    result.address = human.parseAddress(address);
  }

  res.json({ message: "Success", result });
});

app.get("/parseaddress", (req, res) => {
  let addresses = req.query.address;

  // Convert single address input into an array
  if (!Array.isArray(addresses)) {
    addresses = [addresses];
  }

  if (!addresses.every((address) => typeof address === "string")) {
    return res.status(400).json({ message: "Invalid addresses provided" });
  }

  try {
    // Parse each address in the array
    const parsedAddresses = addresses.map((address) =>
      human.parseAddress(address)
    );
    res.json({ message: "Success", parsedAddresses });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

app.get("/parsename", (req, res) => {
  let names = req.query.fullName;

  // Convert single name input into an array
  if (!Array.isArray(names)) {
    names = [names];
  }

  // Validate input
  if (!names.every((name) => typeof name === "string")) {
    return res.status(400).json({ message: "Invalid names provided" });
  }

  try {
    // Parse each name in the array
    const parsedNames = names.map((name) => human.parseName(name));
    res.json({ message: "Success", parsedNames });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

////////////////////////////////////////////////////////////////////////////////
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
