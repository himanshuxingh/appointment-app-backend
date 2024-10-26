var express = require("express");
var mongoClient = require("mongodb").MongoClient;
var cors = require("cors");
const { MongoGCPError } = require("mongodb");
var app = express();

require('dotenv').config();
const conStr = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
    res.send({message:"Home"});
});

app.get("/get-users", (req, res) => {
    mongoClient.connect(conStr).then(clientobj => {
        var database = clientobj.db("calenderdb");
        database.collection("users").find({}).toArray().then(documents => {
            res.send(documents);
            res.end();
        });
    });
});

app.get("/get-appointments/:userid", (req, res) => {
    mongoClient.connect(conStr).then(clientobj => {
        var database = clientobj.db("calenderdb");
        database.collection("appointments").find({ UserId: req.params.userid }).toArray().then((documents) => {
            res.send(documents);
            res.end();
        });
    });
});


app.get("/appointment/:appointmentid", (req, res) => {
    mongoClient.connect(conStr).then(clientobj => {
        var database = clientobj.db("calenderdb");
        database.collection("appointments").findOne({ Appointment_Id: parseInt(req.params.appointmentid) }).then((documents) => {
            res.send(documents);
            res.end();
        });
    });
});


app.post("/register-user", (req, res) => {
    mongoClient.connect(conStr).then((clientobj) => {
        var database = clientobj.db("calenderdb");
        var user = {
            UserId: req.body.UserId,
            UserName: req.body.UserName,
            Password: req.body.Password,
            Email: req.body.Email,
            Mobile: req.body.Mobile
        }
        database.collection("users").insertOne(user).then(() => {
            console.log("user registerd successfully");
            res.end();
        });
    });
});

// add-task
app.post("/add-task", (req, res) => {
    console.log("Request Body in /add-task:", req.body);
    mongoClient.connect(conStr).then((clientobj) => {
        var database = clientobj.db("calenderdb");
        var appointment = {
            Appointment_Id: parseInt(req.body.Appointment_Id),
            Title: req.body.Title,
            Description: req.body.Description,
            Date: new Date(req.body.Date),
            UserId: req.body.UserId
        }
        database.collection("appointments").insertOne(appointment).then(() => {
            console.log("task added successfully");
            res.end();
        });
    });
});

// update 
app.put("/edit-task/:id", (req, res) => {
    mongoClient.connect(conStr).then(clientobj => {
        var database = clientobj.db("calenderdb");
        var appointment = {
            Appointment_Id: parseInt(req.params.id),
            Title: req.body.Title,
            Description: req.body.Description,
            Date: new Date(req.body.Date),
        }
        database.collection("appointments").updateOne({ Appointment_Id: parseInt(req.params.id) }, { $set: appointment }).then(() => {
            console.log("task updated successfully");
            res.end();
        });
    });
});

// remove-task 
app.delete("/remove-task/:id", (req, res) => {
    mongoClient.connect(conStr).then(clientobj => {
        var database = clientobj.db("calenderdb");

        database.collection("appointments").deleteOne({ Appointment_Id: parseInt(req.params.id) })
        .then(() => {
            console.log("task deleted successfully..");
            res.end();
        });
    });
});


app.listen(PORT, () => {
    console.log(`server started at :http://127.0.0.1:${PORT}`);
});

// port