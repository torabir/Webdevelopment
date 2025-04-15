# Webdevelopment
Full-stack web development. React, node.JS, mongoDB, JWT, Socket.IO, (Heroku, AWS, or DigitalOcean). 

# Steps: 
1. Make sure to install all the following dependencies: 

jgdoignd ji0gd gdgd

2. Create environment(folders etc). Connect to github. Initiate npm. 
    git init
    git remote add origin
    git add . 
    git commit -m "First commit"
    git push origin main -- "main" must be branch name
If problems arise: 
    git branch --set-upstream-to=origin/main main
    git pull --rebase origin main
    git push origin main
Go to backend-folder:   
    npm init -y
    npm install express mongoose bcrypt jsonwebtoken cors socket.io

# Start MongoDB in the backbround: 
    brew services start mongodb/brew/mongodb-community
-- For å stoppe: 
    brew services stop mongodb/brew/mongodb-community
-- Bruk av MongoDB (shell): 
    mongosh
-- Sjekke om MongoDB kjører: 
    brew services list



kladd: 

historie: 
 1069  npm install express mongoose bcrypt jsonwebtoken cors socket.io\n
 1149  npm install dotenv\n
 1206  npm install mongodb

# Validering av brukerinndata (epost, riktig format etc): 
 npm install express-validator
