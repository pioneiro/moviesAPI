const PORT = 5192;

const express = require("express");
const api = require("needle");

const index = express();

index.set("view engine", "ejs");

index.use(express.static("assets"));

index.get("/", function(req, res) {
	res.render("index");
});

index.get("/results", function(req, res) {
	var q = req.query.q,
		type = req.query.type,
		page = req.query.page || 1;	
	api.get(`http://www.omdbapi.com/?apikey=thewdb&s=${q}&type=${(type== "all")?"":req.query.type}&page=${page}`, function(err, apiRes) {
		if(!err && apiRes.statusCode == 200) {
			const data = apiRes.body;
			if(data.Response == "True") {
				res.render("results", {data: data, srcv: {q: q, type: type, page: page}});
			} else {
				res.render("error", {error: "An error occured while retriving data. Please check your input and try again."});
			}
		} else if(apiRes.statusCode != 200) {
			res.render("error", {error: "Error Code " + apiRes.statusCode + ". An error occured while retriving data."});
		} else {
			res.render("error", {error: "An error occured while retriving data. ERROR Details: " + err});
		}
	});
});

index.get("/details", function(req, res) {
	var movieID = req.query.movieID;
	api.get(`http://www.omdbapi.com/?apikey=thewdb&plot=full&i=${movieID}`, function(err, apiRes) {
		if(!err && apiRes.statusCode == 200) {
			const movie = apiRes.body;
			if(movie.Response == "True") {
				res.render("details", {movie: movie});
			} else {
				res.render("error", {error: "An error occured while retriving data. Please check your input and try again."});
			}
		} else if(apiRes.statusCode != 200) {
			res.render("error", {error: "Error Code " + apiRes.statusCode + ". An error occured while retriving data."});
		} else {
			res.render("error", {error: "An error occured while retriving data. ERROR Details:" + err});
		}
	});
});

index.get("/*", function(req, res) {
	res.render("error", {error: "The page requested couldn't be found."});
});

index.listen(process.env.PORT || PORT, process.env.IP, function() {
	console.log("server initialized at port " + (process.env.PORT || PORT));
});