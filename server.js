const config = require('./config.json');
const path = require('path'); // Import the path module
const express = require('express');
const cookieParser = require('cookie-parser'); // Add cookie-parser middleware
const fs = require('fs');
const app = express();
const session = require('express-session');
app.use(express.static('dashboard'));
require('dotenv').config();


app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware

// Middleware to check if the user is logged in using cookies
function requireLogin(req, res, next) {
  if (req.cookies.user) {

    next(); // User is logged in, continue to the next middleware or route handler
  } else {
    // User is not logged in, send the accessdecline.html file
    res.sendFile(path.join(__dirname, 'dashboard', 'accessdecline.html'));
  }
}


// Handle the login form submission
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the username and password are correct
  if (
    (username === process.env.username || username === config.username) &&
    (password === process.env.password || password === config.password)
  ) {
    // Set a cookie to remember the user's login status
    res.cookie('user', username, {
      maxAge: 7 * 24 * 60 * 60 * 1000
    }); // Cookie will expire in 7 days
    res.redirect('/edit');
  } else {
    res.sendFile(path.join(__dirname, 'dashboard', 'invalidlogin.html'));
  }
});

// Define the countLinesInFolder function in the same file as your Express routes
function countLinesInFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  let totalLines = 0;

  files.forEach((file) => {
    if (file.endsWith('.txt')) {
      const filePath = path.join(folderPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').length;
      totalLines += lines;
    }
  });

  return totalLines;
}

// Define a route for handling sign-out
app.get('/signout', (req, res) => {
  // Clear the user cookie to log them out
  res.clearCookie('user');
  res.redirect('/'); // Redirect the user to the login page
});



// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'login.html'));
});

// Serve the file editor page
app.get('/edit', requireLogin, (req, res) => {
  const freeLines = countLinesInFolder('./free');
  const premiumLines = countLinesInFolder('./premium');
  // Fetch the list of files and populate the select options
  fs.readdir('free', (err, stockFiles) => {
    if (err) {
      res.send(`Error reading directory: ${err}`);
    } else {
      fs.readdir('premium', (err, pstockFiles) => {
        if (err) {
          res.send(`Error reading directory: ${err}`);
        } else {
          const stockFileLinks = stockFiles.map((file) => {
            return `<div class="file-item">
              <span class="file-icon"><i class="fa fa-file-text-o"></i></span>
              <a href="/edit/free/${file}" class="file-name">${file}</a>
              <div class="file-actions">
              <button class="rename-button" data-folder="free" data-file="${file}" onclick="openRenameModal(this)">Rename</button>

                <button class="delete-button" onclick="deleteFile('free', '${file}')">Delete</button>
              </div>
            </div>`;
          }).join('');

          const pstockFileLinks = pstockFiles.map((file) => {
            return `<div class="file-item">
              <span class="file-icon"><i class="fa fa-file-text-o"></i></span>
              <a href="/edit/premium/${file}" class="file-name">${file}</a>
              <div class="file-actions">
              <button class="rename-button" data-folder="premium" data-file="${file}" onclick="openRenameModal(this)">Rename</button>
                <button class="delete-button" onclick="deleteFile('premium', '${file}')">Delete</button>
              </div>
            </div>`;
          }).join('');

          res.send(`
          <html>
          <head>
          <title>Giftmaster Dashboard</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
          <link rel="icon" href="https://cdn.discordapp.com/attachments/1152538414017687684/1154710899525947422/gift.jpg" type="image/jpg">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ionicons@6.0.1/dist/css/ionicons.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" type="text/css" href="https://cdn.discordapp.com/attachments/1149995606564151356/1153592485675798538/style.css">
          </head>
          <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
          <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
          <style>

          .navigation ul li a .icon ion-icon {
            font-size: 1.7rem;
            height: 55px;
          }




          /* Button Styles */
          .button-container {
            position: absolute;
            top: 20px; /* Adjust the top position as needed */
            right: 20px; /* Adjust the right position as needed */
            text-align: center;
          }
          
          .button {
            background-color: var(--blue);
            color: var(--white);
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease-in-out;
          }
          
          .button:hover {
            background-color: #1e177d; /* Darker shade of blue on hover */
          }
          
          /* Popup Styles */
          .popup-container {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px; /* Adjust the width as needed */
            background: var(--white);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 9999; /* Ensure the popup is above other content */
          }
          
          .popup-container h2 {
            font-size: 1.5rem;
            margin-bottom: 10px;
          }
          
          .popup-container .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            font-size: 1.2rem;
          }
          
          .popup-container .close-button:hover {
            color: var(--blue); /* Change the color on hover */
          }
          
          /* Section Title Styles */
          .section-title {
            font-size: 1.5rem;
            color: var(--blue);
            margin-bottom: 10px;
          }
          
          /* File List Styles */
          .files-section {
            margin-top: 20px;
            background: var(--gray);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          
          /* Updated Popup Styles */
          .popup-container {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            background: var(--white);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            text-align: center;
          }
          
          .popup-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: var(--blue);
          }
          
          /* File Select Dropdown Styles */
          .file-select {
            margin-bottom: 15px;
          }
          
          .file-select select {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid var(--black2);
            background-color: var(--white);
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s ease-in-out;
          }
          
          .file-select select:focus {
            border-color: var(--blue);
          }
          
          /* Input Field Styles */
          .fancy-input {
            position: relative;
            margin-bottom: 15px;
          }
          
          .fancy-input input {
            width: 100%;
            padding: 10px 30px 10px 10px;
            border-radius: 5px;
            border: 1px solid var(--black2);
            background-color: var(--white);
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s ease-in-out;
          }
          
          .fancy-input input:focus {
            border-color: var(--blue);
          }
          
          /* Create Button Styles */
          .fancy-button {
            background-color: var(--blue);
            color: var(--white);
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease-in-out;
          }
          
          .fancy-button:hover {
            background-color: #1e177d;
          }
          
          /* Updated File List Styles */
          .file-list {
            list-style: none;
            padding: 0;
          }
          
          .file-list li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 10px;
            background-color: var(--white);
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease-in-out;
          }
          
          .file-list a {
            text-decoration: none;
            color: var(--blue);
            font-size: 1rem;
            transition: color 0.3s ease-in-out;
          }
          
          .file-list li:hover {
            background-color: #f0f0f0; /* Change background color on hover */
          }
          
          .file-list a:hover {
            color: var(--black1); /* Change text color on hover */
          }
          
          /* Delete Button Styles */
          .delete-button {
            color: var(--red); /* Customize the delete button color */
            cursor: pointer;
            font-size: 1.2rem;
            transition: color 0.3s ease-in-out;
          }
          
          .delete-button:hover {
            color: #ff0000; /* Change the color on hover */
          }

          /* Style individual file items */
          /* Style individual file items */
          .file-item {
            display: flex;
            justify-content: space-between; /* Move buttons to the right */
            align-items: center;
            padding: 10px;
            background-color: var(--white);
            border-radius: 5px;
            margin-bottom: 10px;
            transition: background-color 0.3s ease-in-out;
            border: 2px solid transparent; /* Initially, set a transparent border */
          }
          
          .file-item .file-icon {
            margin-right: 10px;
            font-size: 24px;
            color: var(--blue); /* Icon color */
          }
          
          .file-item .file-name {
            text-decoration: none;
            color: var(--blue);
            font-size: 1rem;
            transition: color 0.3s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: flex-start; /* Align items to the left */
            flex-grow: 1; /* Allow the file name to take up available space */
          }
          
          /* Add different border colors on hover for each file item */
          .file-item:nth-child(odd):hover {
            background-color: #f0f0f0; /* Change background color on hover for odd items */
            border-color: var(--blue); /* Border color on hover for odd items */
          }
          
          .file-item:nth-child(even):hover {
            background-color: #f0f0f0; /* Change background color on hover for even items */
            border-color: var(--red); /* Border color on hover for even items */
          }
          
          /* Style the Rename button */
          .rename-button {
            background-color: var(--green); /* Change to your desired color */
            color: var(--black1); /* Set an initial text color */
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 1rem;
            margin-right: 5px; /* Add margin to separate buttons */
            transition: background-color 0.3s ease-in-out;
          }
          
          .rename-button:hover {
            background-color: #1e177d; /* Darker shade of green on hover */
            color: var(--white); /* Change text color on hover */
          }
          
          /* Style the Delete button */
          .delete-button {
            background-color: var(--red); /* Change to red color */
            color: var(--black1); /* Set an initial text color */
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease-in-out;
          }
          
          .delete-button:hover {
            background-color: #ff0000; /* Darker shade of red on hover */
            color: var(--white); /* Change text color on hover */
          }
          
         
          /* Modal styles */
.modal {
  display: none;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  background-color: #fff;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #ccc;
  width: 300px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

/* Close button styles */
.close {
  float: right;
  cursor: pointer;
  font-size: 20px;
}

.close:hover {
  color: #f00;
}

/* Rename popup header styles */
h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

/* Input field styles */
#newFileName {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

/* Rename button styles */
#renameButton {
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
}

#renameButton:hover {
  background-color: #0056b3;
}


        
          </style>
          <body>
          <div class="container">
          <div class="navigation">
              <ul>
                  <li>
                      <a href="#">
                          <span class="icon">
                          <ion-icon name="gift-sharp"></ion-icon>
                          </span>
                          <span class="title">Gift Master</span>
                      </a>
                  </li>
  
                  <li>
                      <a href="/edit">
                          <span class="icon">
                              <ion-icon name="home-outline"></ion-icon>
                          </span>
                          <span class="title">Dashboard</span>
                      </a>
                  </li>
  
        
  
                  <li>
                      <a href="help">
                          <span class="icon">
                              <ion-icon name="help-outline"></ion-icon>
                          </span>
                          <span class="title">Help</span>
                      </a>
                  </li>
  
                  <li>
                      <a href="settings">
                          <span class="icon">
                              <ion-icon name="settings-outline"></ion-icon>
                          </span>
                          <span class="title">Settings</span>
                      </a>
                  </li>
  
                  <li>
                       <a href="/signout">
                          <span class="icon">
                              <ion-icon name="log-out-outline"></ion-icon>
                          </span>
                          <span class="title">Sign Out</span>
                      </a>
                  </li>
              </ul>
          </div>

          <div class="main">
            <div class="topbar">
                <div class="toggle">
                    <ion-icon name="menu-outline"></ion-icon>
                </div>
            </div>

            <div class="cardBox">
                <div class="card">
                    <div>
                    <div class="numbers">${freeLines + premiumLines}</div>
                        <div class="cardName">Total Stock</div>
                    </div>

                    <div class="iconBx">
                        <ion-icon name="eye-outline"></ion-icon>
                    </div>
                </div>

                <div class="card">
                    <div>
                        <div class="numbers">${freeLines}</div>
                        <div class="cardName">Free</div>
                    </div>

                    <div class="iconBx">
                        <ion-icon name="cart-outline"></ion-icon>
                    </div>
                </div>

                <div class="card">
                    <div>
                        <div class="numbers">${premiumLines}</div>
                        <div class="cardName">Premium</div>
                    </div>

                    <div class="iconBx">
                    <ion-icon name="cash-outline"></ion-icon>
                    </div>
                </div>
            </div>
  
            <div class="button-container">
  <button class="button" onclick="toggleCreateForm()">Create</button>
  <div class="popup-container" id="create-form-container">
  <form id="create-form" action="/create" method="post">
    <h2 class="popup-title">Create File</h2>
    <div class="fancy-input-container">
      <div class="file-select">
        <select id="create-folder-select" name="folder" required>
          <option value="free">Stock</option>
          <option value="premium">Pstock</option>
        </select>
      </div>
      <div class="fancy-input">
        <input id="create-file-name" type="text" name="fileName" placeholder="File Name" required>
      </div>
      <button class="fancy-button" type="button" onclick="createFile()">Create</button>
    </div>
  </form>
    </div>
  </div>
          
            <div class="files-section">
      <h2 class="section-title">Free Stock Files</h2>
      <ul class="file-list" id="stock-files">
              ${stockFileLinks}
              </ul>
              </div>
          
              <div class="files-section">
      <h2 class="section-title">Premium Stock Files</h2>
      <ul class="file-list" id="pstock-files">
              ${pstockFileLinks}
              </ul>
    </div>
  </div>
</div>


<div id="renameModal" class="modal">
  <div class="modal-content">
    <span class="close" onclick="closeRenameModal()">&times;</span>
    <h2>Rename File</h2>
    <input type="text" id="newFileName" placeholder="New File Name">
    <button id="renameButton">Rename</button>
  </div>
</div>

<style>
/* Add the heart icon and tooltip styles */
.floating-heart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff5555;
  color: #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.floating-heart i {
  font-size: 24px;
}

.tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  bottom: 50px;
  right: 50px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.inline-text {
  display: inline-block; /* Make the text inline */
  margin-left: 5px; /* Add some spacing between "Made by" and "Science Gear" */
}

.floating-heart:hover {
  background-color: #ff3333;
}

.floating-heart:hover .tooltip {
  opacity: 1;
}
</style>

<div class="floating-heart">
		<i class="fas fa-heart"></i>
		<div class="tooltip">Made with ❤️ By Science Gear</div>
	  </div>

<script>
// JavaScript for toggling the tooltip
const floatingHeart = document.querySelector('.floating-heart');

floatingHeart.addEventListener('click', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
});

// Hide the tooltip initially
document.addEventListener('DOMContentLoaded', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = 'none';
});

</script>



            <script>
            // add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};















            function toggleCreateForm() {
              var createFormContainer = document.getElementById("create-form-container");
              createFormContainer.style.display =
                createFormContainer.style.display === "block" ? "none" : "block";
            }
            
            // Close the popup when clicking outside of it (optional)
            window.addEventListener("click", function (event) {
              var createFormContainer = document.getElementById("create-form-container");
              if (event.target === createFormContainer) {
                createFormContainer.style.display = "none";
              }
            });
            
            function showCreateForm() {
              document.getElementById("create-form").style.display = "block";
              document.getElementById("rename-form").style.display = "none";
              document.getElementById("delete-form").style.display = "none";
            }
            
            function createFile() {
              const folder = document.getElementById("create-folder-select").value;
              const fileName = document.getElementById("create-file-name").value;
            
              // Send an AJAX request to the server to create the file
              fetch('/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  folder: folder,
                  fileName: fileName
                })
              })
                .then(response => response.text())
                .then(message => {
                  alert(message); // Show a pop-up message with the response from the server
                  // Refresh the page to reflect the changes
                  location.reload();
                })
                .catch(error => {
                  console.error('Error:', error);
                });
            }            
          

            // Open the rename modal
            // Open the rename modal with the selected file name
            function openRenameModal(button) {
              const modal = document.getElementById('renameModal');
              const newFileNameInput = document.getElementById('newFileName');
              const folder = button.getAttribute('data-folder'); // Get the folder attribute
              const fileName = button.getAttribute('data-file');
              
              // Set the input field to the current file name
              newFileNameInput.value = fileName;
            
              // Update the onclick event of the "Rename" button in the modal
              const renameButton = document.getElementById('renameButton');
              renameButton.onclick = function () {
                confirmRenameFile(folder, fileName); // Pass both folder and fileName
              };
            
              modal.style.display = 'block';
            }
            
            

// Close the rename modal
function closeRenameModal() {
  const modal = document.getElementById('renameModal');
  modal.style.display = 'none';
}

// Rename the file and close the modal
function confirmRenameFile(folder, fileName) {
  const newName = document.getElementById('newFileName').value;
  if (newName !== '') {
    // Send an AJAX request to the server to rename the file
    fetch('/rename', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folder: folder,
        oldFileName: fileName,
        newFileName: newName,
      }),
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
        // Refresh the page to reflect the changes
        location.reload();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    closeRenameModal(); // Close the modal after renaming
  }
}


              function renameFile(folder, fileName) {
                const newName = prompt('Enter the new name for the file:');
                if (newName !== null) {
                  // Send an AJAX request to the server to rename the file
                  fetch('/rename', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      folder: folder,
                      oldFileName: fileName,
                      newFileName: newName
                    })
                  })
                    .then(response => response.text())
                    .then(message => {
                      alert(message);
                      // Refresh the page to reflect the changes
                      location.reload();
                    })
                    .catch(error => {
                      console.error('Error:', error);
                    });
                }
              }
          
              function deleteFile(folder, fileName) {
                // Send an AJAX request to the server to delete the file
                fetch('/delete', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    folder: folder,
                    fileName: fileName
                  })
                })
                  .then(response => response.text())
                  .then(message => {
                    alert(message);
                    // Refresh the page to reflect the changes
                    location.reload();
                  })
                  .catch(error => {
                    console.error('Error:', error);
                  });
              }
            </script>
          </body>
          </html>          
          `);
        }
      });
    }
  });
});

// Serve the help page
app.get('/help', requireLogin, (req, res) => {
  // Create the content for your help page here
  const freeLines = countLinesInFolder('./free');
  const premiumLines = countLinesInFolder('./premium');
  // Fetch the list of files and populate the select options
  const helpContent = `<html>
  <head>
  <title>Giftmaster Dashboard -help</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="icon" href="https://cdn.discordapp.com/attachments/1152538414017687684/1154710899525947422/gift.jpg" type="image/jpg">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ionicons@6.0.1/dist/css/ionicons.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.discordapp.com/attachments/1149995606564151356/1153592485675798538/style.css">
  </head>
  <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
  <style>

  .navigation ul li a .icon ion-icon {
    font-size: 1.7rem;
    height: 55px;
  }




  /* Button Styles */
  .button-container {
    position: absolute;
    top: 20px; /* Adjust the top position as needed */
    right: 20px; /* Adjust the right position as needed */
    text-align: center;
  }
  
  .button {
    background-color: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease-in-out;
  }
  
  .button:hover {
    background-color: #1e177d; /* Darker shade of blue on hover */
  }
  
  /* Popup Styles */
  .popup-container {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px; /* Adjust the width as needed */
    background: var(--white);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999; /* Ensure the popup is above other content */
  }
  
  .popup-container h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .popup-container .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .popup-container .close-button:hover {
    color: var(--blue); /* Change the color on hover */
  }
  
  /* Section Title Styles */
  .section-title {
    font-size: 1.5rem;
    color: var(--blue);
    margin-bottom: 10px;
  }
  
  /* File List Styles */
  .files-section {
    margin-top: 20px;
    background: var(--gray);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  /* Updated Popup Styles */
  .popup-container {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    background: var(--white);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    text-align: center;
  }
  
  .popup-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: var(--blue);
  }
  
  /* File Select Dropdown Styles */
  .file-select {
    margin-bottom: 15px;
  }
  
  .file-select select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid var(--black2);
    background-color: var(--white);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s ease-in-out;
  }
  
  .file-select select:focus {
    border-color: var(--blue);
  }
  
  /* Input Field Styles */
  .fancy-input {
    position: relative;
    margin-bottom: 15px;
  }
  
  .fancy-input input {
    width: 100%;
    padding: 10px 30px 10px 10px;
    border-radius: 5px;
    border: 1px solid var(--black2);
    background-color: var(--white);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s ease-in-out;
  }
  
  .fancy-input input:focus {
    border-color: var(--blue);
  }
  
  /* Create Button Styles */
  .fancy-button {
    background-color: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease-in-out;
  }
  
  .fancy-button:hover {
    background-color: #1e177d;
  }
  
  /* Updated File List Styles */
  .file-list {
    list-style: none;
    padding: 0;
  }
  
  .file-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    background-color: var(--white);
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease-in-out;
  }
  
  .file-list a {
    text-decoration: none;
    color: var(--blue);
    font-size: 1rem;
    transition: color 0.3s ease-in-out;
  }
  
  .file-list li:hover {
    background-color: #f0f0f0; /* Change background color on hover */
  }
  
  .file-list a:hover {
    color: var(--black1); /* Change text color on hover */
  }
  
  /* Delete Button Styles */
  .delete-button {
    color: var(--red); /* Customize the delete button color */
    cursor: pointer;
    font-size: 1.2rem;
    transition: color 0.3s ease-in-out;
  }
  
  .delete-button:hover {
    color: #ff0000; /* Change the color on hover */
  }

  /* Style individual file items */
  /* Style individual file items */
  .file-item {
    display: flex;
    justify-content: space-between; /* Move buttons to the right */
    align-items: center;
    padding: 10px;
    background-color: var(--white);
    border-radius: 5px;
    margin-bottom: 10px;
    transition: background-color 0.3s ease-in-out;
    border: 2px solid transparent; /* Initially, set a transparent border */
  }
  
  .file-item .file-icon {
    margin-right: 10px;
    font-size: 24px;
    color: var(--blue); /* Icon color */
  }
  
  .file-item .file-name {
    text-decoration: none;
    color: var(--blue);
    font-size: 1rem;
    transition: color 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Align items to the left */
    flex-grow: 1; /* Allow the file name to take up available space */
  }
  
  /* Add different border colors on hover for each file item */
  .file-item:nth-child(odd):hover {
    background-color: #f0f0f0; /* Change background color on hover for odd items */
    border-color: var(--blue); /* Border color on hover for odd items */
  }
  
  .file-item:nth-child(even):hover {
    background-color: #f0f0f0; /* Change background color on hover for even items */
    border-color: var(--red); /* Border color on hover for even items */
  }
  
  /* Style the Rename button */
  .rename-button {
    background-color: var(--green); /* Change to your desired color */
    color: var(--black1); /* Set an initial text color */
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1rem;
    margin-right: 5px; /* Add margin to separate buttons */
    transition: background-color 0.3s ease-in-out;
  }
  
  .rename-button:hover {
    background-color: #1e177d; /* Darker shade of green on hover */
    color: var(--white); /* Change text color on hover */
  }
  
  /* Style the Delete button */
  .delete-button {
    background-color: var(--red); /* Change to red color */
    color: var(--black1); /* Set an initial text color */
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease-in-out;
  }
  
  .delete-button:hover {
    background-color: #ff0000; /* Darker shade of red on hover */
    color: var(--white); /* Change text color on hover */
  }
  
 
  /* Modal styles */
.modal {
display: none;
position: fixed;
z-index: 1;
left: 0;
top: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
background-color: #fff;
margin: 15% auto;
padding: 20px;
border: 1px solid #ccc;
width: 300px;
box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
border-radius: 5px;
}

/* Close button styles */
.close {
float: right;
cursor: pointer;
font-size: 20px;
}

.close:hover {
color: #f00;
}

/* Rename popup header styles */
h2 {
font-size: 18px;
margin-bottom: 10px;
}

/* Input field styles */
#newFileName {
width: 100%;
padding: 10px;
margin-bottom: 15px;
border: 1px solid #ccc;
border-radius: 4px;
font-size: 16px;
}

/* Rename button styles */
#renameButton {
background-color: #007bff;
color: #fff;
border: none;
border-radius: 4px;
padding: 10px 20px;
cursor: pointer;
font-size: 16px;
}

#renameButton:hover {
background-color: #0056b3;
}

.bot-commands {
    margin-top: 20px;
    padding: 20px;
    background-color: var(--gray);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.bot-commands h2 {
    font-size: 1.5rem;
    color: var(--blue);
    margin-bottom: 10px;
}

.bot-commands ul {
    list-style-type: none;
    padding: 0;
}

.bot-commands li {
    font-size: 1rem;
    margin-bottom: 10px;
}

.bot-commands strong {
    color: var(--green); /* Customize the color of bot command names */
}

/* Style the Features section with the class "features" */
.features {
    margin-top: 20px;
    padding: 20px;
    background-color: var(--gray);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.features h2 {
    font-size: 1.5rem;
    color: var(--blue);
    margin-bottom: 10px;
}

.features ul {
    list-style-type: disc; /* Use bullet points for list items */
    padding-left: 20px; /* Add some indentation to the list items */
}

.features li {
    font-size: 1rem;
    margin-bottom: 10px;
    line-height: 1.4; /* Increase line height for better readability */
}

.features strong {
    color: var(--green); /* Customize the color of strong elements */
}

  </style>
  <body>
  <div class="container">
  <div class="navigation">
      <ul>
          <li>
              <a href="#">
                  <span class="icon">
                  <ion-icon name="gift-sharp"></ion-icon>
                  </span>
                  <span class="title">Gift Master</span>
              </a>
          </li>

          <li>
              <a href="/edit">
                  <span class="icon">
                      <ion-icon name="home-outline"></ion-icon>
                  </span>
                  <span class="title">Dashboard</span>
              </a>
          </li>



          <li>
              <a href="/help">
                  <span class="icon">
                      <ion-icon name="help-outline"></ion-icon>
                  </span>
                  <span class="title">Help</span>
              </a>
          </li>

          <li>
              <a href="settings">
                  <span class="icon">
                      <ion-icon name="settings-outline"></ion-icon>
                  </span>
                  <span class="title">Settings</span>
              </a>
          </li>

          <li>
               <a href="/signout">
                  <span class="icon">
                      <ion-icon name="log-out-outline"></ion-icon>
                  </span>
                  <span class="title">Sign Out</span>
              </a>
          </li>
      </ul>
  </div>

  <div class="main">
    <div class="topbar">
        <div class="toggle">
            <ion-icon name="menu-outline"></ion-icon>
        </div>
    </div>

    <div class="cardBox">
        <div class="card">
            <div>
            <div class="numbers">${freeLines + premiumLines}</div>
                <div class="cardName">Total Stock</div>
            </div>

            <div class="iconBx">
                <ion-icon name="eye-outline"></ion-icon>
            </div>
        </div>

        <div class="card">
            <div>
                <div class="numbers">${freeLines}</div>
                <div class="cardName">Free</div>
            </div>

            <div class="iconBx">
                <ion-icon name="cart-outline"></ion-icon>
            </div>
        </div>

        <div class="card">
            <div>
                <div class="numbers">${premiumLines}</div>
                <div class="cardName">Premium</div>
            </div>

            <div class="iconBx">
            <ion-icon name="cash-outline"></ion-icon>
            </div>
        </div>
    </div>


<div class="bot-commands">
    <h2>Bot Commands</h2>
    <ul>
        <li>
            <strong>/help</strong>: Displays the help command.
        </li>
        <li>
            <strong>/create</strong>: Create a new service.
        </li>
        <li>
            <strong>/free</strong>: Generate a reward.
        </li>
        <li>
            <strong>/add</strong>: Add a reward to the stock.
        </li>
        <li>
            <strong>/stock</strong>: View the current stock.
        </li>
        <li>
            <strong>/premium</strong>: Generate a premium reward.
        </li>
    </ul>
</div>

<div class="features">
    <h2>Features</h2>
    <ul>
      <li><strong>Automated Giveaways:</strong> GiftMaster automates the entire giveaway process, from start to finish. Simply set up the giveaway parameters, and GiftMaster will handle the rest, including participant entry tracking, winner selection, and prize distribution.</li>
      <li><strong>Safety and Security:</strong> GiftMaster ensures a safe and secure giveaway experience. The bot employs various anti-cheat measures to prevent fraudulent entries, ensuring fairness for all participants.</li>
      <li><strong>Easy Configuration:</strong> Setting up GiftMaster is a breeze. The bot provides an intuitive and user-friendly setup process, guiding you through each step to configure the giveaway settings according to your preferences.</li>
    </ul>
  </div>

  <style>
  /* Add the heart icon and tooltip styles */
  .floating-heart {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #ff5555;
    color: #fff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .floating-heart i {
    font-size: 24px;
  }
  
  .tooltip {
    position: absolute;
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
    bottom: 50px;
    right: 50px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  .inline-text {
    display: inline-block; /* Make the text inline */
    margin-left: 5px; /* Add some spacing between "Made by" and "Science Gear" */
  }
  
  .floating-heart:hover {
    background-color: #ff3333;
  }
  
  .floating-heart:hover .tooltip {
    opacity: 1;
  }
  </style>
  
  <div class="floating-heart">
      <i class="fas fa-heart"></i>
      <div class="tooltip">Made with ❤️ By Science Gear</div>
      </div>
  
  <script>
  // JavaScript for toggling the tooltip
  const floatingHeart = document.querySelector('.floating-heart');
  
  floatingHeart.addEventListener('click', () => {
    const tooltip = floatingHeart.querySelector('.tooltip');
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
  });
  
  // Hide the tooltip initially
  document.addEventListener('DOMContentLoaded', () => {
    const tooltip = floatingHeart.querySelector('.tooltip');
    tooltip.style.display = 'none';
  });
  
  </script>
  
  

    <script>
    // add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
list.forEach((item) => {
item.classList.remove("hovered");
});
this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
navigation.classList.toggle("active");
main.classList.toggle("active");
};


    </script>
  </body>
  </html> 
  `;

  res.send(helpContent);
});


// Serve the settings page
app.get('/settings', requireLogin, (req, res) => {
  // Create the content for your help page here
  const freeLines = countLinesInFolder('./free');
  const premiumLines = countLinesInFolder('./premium');
  // Create the content for your settings page here
  const settingsContent = `<html>
  <head>
  <title>Giftmaster Dashboard -settings</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
  <link rel="icon" href="https://cdn.discordapp.com/attachments/1152538414017687684/1154710899525947422/gift.jpg" type="image/jpg">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ionicons@6.0.1/dist/css/ionicons.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.discordapp.com/attachments/1149995606564151356/1153592485675798538/style.css">
  </head>
  <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
  <style>


  /* Center the form vertically */
        .settings-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        /* Style the form */
        #settings-form {
            width: 100%; /* Expand to the maximum width */
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        label {
            font-size: 1.2rem;
        }

        input[type="text"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s ease-in-out;
        }

        input[type="text"]:focus {
            border-color: var(--blue);
        }

        /* Style the submit button */
        input[type="submit"] {
            background-color: var(--blue);
            color: var(--white);
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease-in-out;
        }

        input[type="submit"]:hover {
            background-color: #1e177d;
        }

        .card {
          margin-bottom: 20px; /* Add margin to the bottom of the card element */
      }
      
      .settings-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px; /* Add margin to the top of the settings-container */
          margin-bottom: 20px; /* Add margin to the bottom of the settings-container */
      }
      

        /* Add media queries for responsiveness */
        @media screen and (max-width: 600px) {
            .settings-container {
                padding: 0 10px;
            }

            #settings-form {
                max-width: none;
                width: 100%;
            }
        }




  .navigation ul li a .icon ion-icon {
    font-size: 1.7rem;
    height: 55px;
  }




  /* Button Styles */
  .button-container {
    position: absolute;
    top: 20px; /* Adjust the top position as needed */
    right: 20px; /* Adjust the right position as needed */
    text-align: center;
  }
  
  .button {
    background-color: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease-in-out;
  }
  
  .button:hover {
    background-color: #1e177d; /* Darker shade of blue on hover */
  }
  
  /* Popup Styles */
  .popup-container {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px; /* Adjust the width as needed */
    background: var(--white);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999; /* Ensure the popup is above other content */
  }
  
  .popup-container h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .popup-container .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .popup-container .close-button:hover {
    color: var(--blue); /* Change the color on hover */
  }
  
  /* Section Title Styles */
  .section-title {
    font-size: 1.5rem;
    color: var(--blue);
    margin-bottom: 10px;
  }
  
  /* File List Styles */
  .files-section {
    margin-top: 20px;
    background: var(--gray);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  /* Updated Popup Styles */
  .popup-container {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    background: var(--white);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    text-align: center;
  }
  
  .popup-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: var(--blue);
  }
  
  /* File Select Dropdown Styles */
  .file-select {
    margin-bottom: 15px;
  }
  
  .file-select select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid var(--black2);
    background-color: var(--white);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s ease-in-out;
  }
  
  .file-select select:focus {
    border-color: var(--blue);
  }
  
  /* Input Field Styles */
  .fancy-input {
    position: relative;
    margin-bottom: 15px;
  }
  
  .fancy-input input {
    width: 100%;
    padding: 10px 30px 10px 10px;
    border-radius: 5px;
    border: 1px solid var(--black2);
    background-color: var(--white);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s ease-in-out;
  }
  
  .fancy-input input:focus {
    border-color: var(--blue);
  }
  
  /* Create Button Styles */
  .fancy-button {
    background-color: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease-in-out;
  }
  
  .fancy-button:hover {
    background-color: #1e177d;
  }
  
  /* Updated File List Styles */
  .file-list {
    list-style: none;
    padding: 0;
  }
  
  .file-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    background-color: var(--white);
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease-in-out;
  }
  
  .file-list a {
    text-decoration: none;
    color: var(--blue);
    font-size: 1rem;
    transition: color 0.3s ease-in-out;
  }
  
  .file-list li:hover {
    background-color: #f0f0f0; /* Change background color on hover */
  }
  
  .file-list a:hover {
    color: var(--black1); /* Change text color on hover */
  }
  
  /* Delete Button Styles */
  .delete-button {
    color: var(--red); /* Customize the delete button color */
    cursor: pointer;
    font-size: 1.2rem;
    transition: color 0.3s ease-in-out;
  }
  
  .delete-button:hover {
    color: #ff0000; /* Change the color on hover */
  }

  /* Style individual file items */
  /* Style individual file items */
  .file-item {
    display: flex;
    justify-content: space-between; /* Move buttons to the right */
    align-items: center;
    padding: 10px;
    background-color: var(--white);
    border-radius: 5px;
    margin-bottom: 10px;
    transition: background-color 0.3s ease-in-out;
    border: 2px solid transparent; /* Initially, set a transparent border */
  }
  
  .file-item .file-icon {
    margin-right: 10px;
    font-size: 24px;
    color: var(--blue); /* Icon color */
  }
  
  .file-item .file-name {
    text-decoration: none;
    color: var(--blue);
    font-size: 1rem;
    transition: color 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Align items to the left */
    flex-grow: 1; /* Allow the file name to take up available space */
  }
  
  /* Add different border colors on hover for each file item */
  .file-item:nth-child(odd):hover {
    background-color: #f0f0f0; /* Change background color on hover for odd items */
    border-color: var(--blue); /* Border color on hover for odd items */
  }
  
  .file-item:nth-child(even):hover {
    background-color: #f0f0f0; /* Change background color on hover for even items */
    border-color: var(--red); /* Border color on hover for even items */
  }
  
  /* Style the Rename button */
  .rename-button {
    background-color: var(--green); /* Change to your desired color */
    color: var(--black1); /* Set an initial text color */
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1rem;
    margin-right: 5px; /* Add margin to separate buttons */
    transition: background-color 0.3s ease-in-out;
  }
  
  .rename-button:hover {
    background-color: #1e177d; /* Darker shade of green on hover */
    color: var(--white); /* Change text color on hover */
  }
  
  /* Style the Delete button */
  .delete-button {
    background-color: var(--red); /* Change to red color */
    color: var(--black1); /* Set an initial text color */
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease-in-out;
  }
  
  .delete-button:hover {
    background-color: #ff0000; /* Darker shade of red on hover */
    color: var(--white); /* Change text color on hover */
  }
  
 
  /* Modal styles */
.modal {
display: none;
position: fixed;
z-index: 1;
left: 0;
top: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
background-color: #fff;
margin: 15% auto;
padding: 20px;
border: 1px solid #ccc;
width: 300px;
box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
border-radius: 5px;
}

/* Close button styles */
.close {
float: right;
cursor: pointer;
font-size: 20px;
}

.close:hover {
color: #f00;
}

/* Rename popup header styles */
h2 {
font-size: 18px;
margin-bottom: 10px;
}

/* Input field styles */
#newFileName {
width: 100%;
padding: 10px;
margin-bottom: 15px;
border: 1px solid #ccc;
border-radius: 4px;
font-size: 16px;
}

/* Rename button styles */
#renameButton {
background-color: #007bff;
color: #fff;
border: none;
border-radius: 4px;
padding: 10px 20px;
cursor: pointer;
font-size: 16px;
}

#renameButton:hover {
background-color: #0056b3;
}

.bot-commands {
    margin-top: 20px;
    padding: 20px;
    background-color: var(--gray);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.bot-commands h2 {
    font-size: 1.5rem;
    color: var(--blue);
    margin-bottom: 10px;
}

.bot-commands ul {
    list-style-type: none;
    padding: 0;
}

.bot-commands li {
    font-size: 1rem;
    margin-bottom: 10px;
}

.bot-commands strong {
    color: var(--green); /* Customize the color of bot command names */
}

  </style>
  <body>
  <div class="container">
  <div class="navigation">
      <ul>
          <li>
              <a href="#">
                  <span class="icon">
                  <ion-icon name="gift-sharp"></ion-icon>
                  </span>
                  <span class="title">Gift Master</span>
              </a>
          </li>

          <li>
              <a href="/edit">
                  <span class="icon">
                      <ion-icon name="home-outline"></ion-icon>
                  </span>
                  <span class="title">Dashboard</span>
              </a>
          </li>



          <li>
              <a href="/help">
                  <span class="icon">
                      <ion-icon name="help-outline"></ion-icon>
                  </span>
                  <span class="title">Help</span>
              </a>
          </li>

          <li>
              <a href="/settings">
                  <span class="icon">
                      <ion-icon name="settings-outline"></ion-icon>
                  </span>
                  <span class="title">Settings</span>
              </a>
          </li>

          <li>
               <a href="/signout">
                  <span class="icon">
                      <ion-icon name="log-out-outline"></ion-icon>
                  </span>
                  <span class="title">Sign Out</span>
              </a>
          </li>
      </ul>
  </div>

  <div class="main">
    <div class="topbar">
        <div class="toggle">
            <ion-icon name="menu-outline"></ion-icon>
        </div>
    </div>

    <div class="cardBox">
        <div class="card">
            <div>
            <div class="numbers">${freeLines + premiumLines}</div>
                <div class="cardName">Total Stock</div>
            </div>

            <div class="iconBx">
                <ion-icon name="eye-outline"></ion-icon>
            </div>
        </div>

        <div class="card">
            <div>
                <div class="numbers">${freeLines}</div>
                <div class="cardName">Free</div>
            </div>

            <div class="iconBx">
                <ion-icon name="cart-outline"></ion-icon>
            </div>
        </div>

        <div class="card">
            <div>
                <div class="numbers">${premiumLines}</div>
                <div class="cardName">Premium</div>
            </div>

            <div class="iconBx">
            <ion-icon name="cash-outline"></ion-icon>
            </div>
        </div>
    </div>

    <div class="settings-container">
    <form id="settings-form">
        <label for="status">Status:</label>
        <input type="text" id="status" name="status" value="${config.status}"><br><br>

        <label for="genCooldown">General Cooldown: (seconds)</label>
        <input type="text" id="genCooldown" name="genCooldown" value="${config.genCooldown}"><br><br>

        <label for="premiumCooldown">Premium Cooldown: (seconds)</label>
        <input type="text" id="premiumCooldown" name="premiumCooldown" value="${config.premiumCooldown}"><br><br>

        <label for="website">Website:</label>
        <input type="text" id="website" name="website" value="${config.website}"><br><br>

        <label for="banner">Banner:</label>
        <input type="text" id="banner" name="banner" value="${config.banner}"><br><br>

        <label for="footer">Footer:</label>
        <input type="text" id="footer" name="footer" value="${config.footer}"><br><br>

        <input type="submit" value="Save Settings">
    </form>
</div>
  </div>
</div>


<style>
/* Add the heart icon and tooltip styles */
.floating-heart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff5555;
  color: #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.floating-heart i {
  font-size: 24px;
}

.tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  bottom: 50px;
  right: 50px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.inline-text {
  display: inline-block; /* Make the text inline */
  margin-left: 5px; /* Add some spacing between "Made by" and "Science Gear" */
}

.floating-heart:hover {
  background-color: #ff3333;
}

.floating-heart:hover .tooltip {
  opacity: 1;
}
</style>

<div class="floating-heart">
		<i class="fas fa-heart"></i>
		<div class="tooltip">Made with ❤️ By Science Gear</div>
	  </div>

<script>
// JavaScript for toggling the tooltip
const floatingHeart = document.querySelector('.floating-heart');

floatingHeart.addEventListener('click', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
});

// Hide the tooltip initially
document.addEventListener('DOMContentLoaded', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = 'none';
});

</script>


    <script>

    // Handle form submission
const settingsForm = document.getElementById("settings-form");

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(settingsForm);
  const formDataObject = {};

  formData.forEach((value, key) => {
    formDataObject[key] = value;
  });

  // Send the form data to the server for saving
  const response = await fetch("/save-settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formDataObject),
  });

  if (response.ok) {
    alert("Settings saved successfully!");
  } else {
    alert("Failed to save settings.");
  }
});



    // add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
list.forEach((item) => {
item.classList.remove("hovered");
});
this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
navigation.classList.toggle("active");
main.classList.toggle("active");
};


    </script>
  </body>
  </html> `;

  res.send(settingsContent);
});


const bodyParser = require("body-parser");

// Add bodyParser middleware to parse JSON data
app.use(bodyParser.json());

// Route to save settings
app.post("/save-settings", requireLogin, (req, res) => {
  const settings = req.body;

  // Read the current contents of config.json
  fs.readFile('./config.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading config file:", err);
      res.status(500).json({
        error: "Failed to read config file"
      });
      return;
    }

    const config = JSON.parse(data);

    // Update the config object with the new settings
    Object.assign(config, settings);

    // Write the updated config object back to config.json
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error writing config file:", err);
        res.status(500).json({
          error: "Failed to save settings"
        });
        return;
      }

      res.json({
        message: "Settings saved successfully"
      });
    });
  });
});


app.use(express.urlencoded({
  extended: true
}));


// Handle the creation of a new file
app.post('/create', requireLogin, (req, res) => {
  const folder = req.body.folder;
  let fileName = req.body.fileName;

  // Check if the folder is valid
  if (folder === 'free' || folder === 'premium') {
    // Check if the file name has .txt extension, if not, add it
    let fullFileName = fileName; // Create a new variable to store the full file name
    if (!fullFileName.endsWith('.txt')) {
      fullFileName += '.txt';
    }

    // Create the file in the selected folder
    fs.writeFile(`${folder}/${fullFileName}`, '', (err) => {
      if (err) {
        res.send(`Error creating file: ${err}`);
      } else {
        res.send('File created successfully');
      }
    });
  } else {
    res.send('Invalid folder selection');
  }
});


// Handle the file rename request
app.post('/rename', requireLogin, (req, res) => {
  const folder = req.body.folder;
  const oldFileName = req.body.oldFileName;
  let newFileName = req.body.newFileName;

  // Check if the new file name has .txt extension, if it does, remove it
  if (newFileName.endsWith('.txt')) {
    newFileName = newFileName.slice(0, -4); // Remove the last 4 characters (.txt)
  }

  const oldFilePath = `${folder}/${oldFileName}`;
  const newFilePath = `${folder}/${newFileName}.txt`; // Add .txt extension to the new file name

  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) {
      res.status(500).send(`Error renaming file: ${err}`);
    } else {
      res.send('File renamed successfully');
    }
  });
});


// Handle the file delete request
app.post('/delete', requireLogin, (req, res) => {
  const folder = req.body.folder;
  const fileName = req.body.fileName;
  const filePath = `${folder}/${fileName}`;

  fs.unlink(filePath, (err) => {
    if (err) {
      res.status(500).send(`Error deleting file: ${err}`);
    } else {
      res.send('File deleted successfully');
    }
  });
});


// Serve the file editor page with the selected file
app.get('/edit/:folder/:filename', requireLogin, (req, res) => {
  const folder = req.params.folder;
  const filename = req.params.filename;
  const filePath = `${folder}/${filename}`;

  // Read the content of the selected file
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      res.send(`Error reading file: ${err}`);
    } else {
      res.send(`
        <!DOCTYPE html>
<html>
<head>
<title>Giftmaster Editor</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
<link rel="icon" href="https://cdn.discordapp.com/attachments/1152538414017687684/1154710899525947422/gift.jpg" type="image/jpg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #333;
            color: #fff;
            margin: 0;
            padding: 0;
        }

        .navbar {
            background-color: #333;
            color: #fff;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .navbar i {
            margin-right: 10px;
        }

        .navbar button {
            background-color: transparent;
            color: #fff;
            border: none;
            cursor: pointer;
            font-size: 18px;
        }

        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 60px); /* Adjusted for navbar height */
        }

        .editor {
            width: 90%; /* Adjusted for responsiveness */
            max-width: 800px; /* Adjusted for responsiveness */
            background-color: #1e1e1e;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        .editor textarea {
            width: 100%;
            min-height: 400px;
            background-color: #333;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Courier New', monospace; /* Monospace font for code */
            font-size: 16px;
            resize: vertical;
        }

        .editor button {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 18px;
        }

        .footer {
            background-color: #222;
            color: #fff;
            padding: 20px;
            text-align: center;
        }

        .footer-text {
            font-size: 14px;
        }

        .footer-link {
            color: #4CAF50;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer-link:hover {
            color: #ff9900;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <button onclick="history.back()"><i class="fas fa-arrow-left"></i>Back</button>
        <h1><i class="fas fa-file"></i>Edit File: ${folder}/${filename}</h1>
        <i class="fas fa-moon"></i>
    </div>
    <div class="container">
        <div class="editor">
            <form action="/save/${folder}/${filename}" method="post">
                <textarea name="content" placeholder="File Content" required>${content}</textarea>
                <button type="submit">Save</button>
            </form>
        </div>
    </div>
    <style>
/* Add the heart icon and tooltip styles */
.floating-heart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff5555;
  color: #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.floating-heart i {
  font-size: 24px;
}

.tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  bottom: 50px;
  right: 50px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.inline-text {
  display: inline-block; /* Make the text inline */
  margin-left: 5px; /* Add some spacing between "Made by" and "Science Gear" */
}

.floating-heart:hover {
  background-color: #ff3333;
}

.floating-heart:hover .tooltip {
  opacity: 1;
}
</style>

<div class="floating-heart">
		<i class="fas fa-heart"></i>
		<div class="tooltip">Made with ❤️ By Science Gear</div>
	  </div>

<script>
// JavaScript for toggling the tooltip
const floatingHeart = document.querySelector('.floating-heart');

floatingHeart.addEventListener('click', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
});

// Hide the tooltip initially
document.addEventListener('DOMContentLoaded', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = 'none';
});

</script>


</body>
</html>

        `);
    }
  });
});



// Handle the file saving
app.post('/save/:folder/:filename', requireLogin, (req, res) => {
  const folder = req.params.folder;
  const filename = req.params.filename;
  const content = req.body.content;
  const filePath = `${folder}/${filename}`;

  // Save the file
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      res.send(`Error saving file: ${err}`);
    } else {
      res.send(`
          <html>
          <head>
          <title>Saved</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
          <link rel="icon" href="https://cdn.discordapp.com/attachments/1152538414017687684/1154710899525947422/gift.jpg" type="image/jpg">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                background-color: #222;
                color: #fff;
              }
        
              h1 {
                color: #4CAF50;
              }
        
              .popup {
                opacity: 0;
                transform: scale(0);
                animation-name: fade-in;
                animation-duration: 0.5s;
                animation-fill-mode: forwards;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
              }
        
              @keyframes fade-in {
                0% {
                  opacity: 0;
                  transform: scale(0);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
        
              .popup-icon {
                font-size: 64px;
                color: #4CAF50;
                margin-bottom: 20px;
                animation-name: checkmark-animation;
                animation-duration: 0.5s;
                animation-fill-mode: forwards;
              }
        
              @keyframes checkmark-animation {
                0% {
                  opacity: 0;
                  transform: scale(0);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
        
              .popup-message {
                font-size: 24px;
                margin-bottom: 20px;
              }
        
              .popup-button {
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                text-decoration: none;
                transition: background-color 0.3s ease;
              }
        
              .popup-button:hover {
                background-color: #45a049;
              }
            </style>
          </head>
          <body>
            <div class="popup">
              <i class="fas fa-check-circle popup-icon"></i>
              <h1 class="popup-message">File "${folder}/${filename}" saved successfully</h1>
              <a href="/edit" class="popup-button">Back to Editor</a>
            </div>
            <style>
/* Add the heart icon and tooltip styles */
.floating-heart {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff5555;
  color: #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.floating-heart i {
  font-size: 24px;
}

.tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  bottom: 50px;
  right: 50px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.inline-text {
  display: inline-block; /* Make the text inline */
  margin-left: 5px; /* Add some spacing between "Made by" and "Science Gear" */
}

.floating-heart:hover {
  background-color: #ff3333;
}

.floating-heart:hover .tooltip {
  opacity: 1;
}
</style>

<div class="floating-heart">
		<i class="fas fa-heart"></i>
		<div class="tooltip">Made with ❤️ By Science Gear</div>
	  </div>

<script>
// JavaScript for toggling the tooltip
const floatingHeart = document.querySelector('.floating-heart');

floatingHeart.addEventListener('click', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
});

// Hide the tooltip initially
document.addEventListener('DOMContentLoaded', () => {
  const tooltip = floatingHeart.querySelector('.tooltip');
  tooltip.style.display = 'none';
});

</script>


          </body>
        </html>      
          `);
    }
  });
});



// Start the server
app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});