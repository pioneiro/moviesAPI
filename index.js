const PORT = process.env.PORT || 5192;

import express from "express";
import needle from "needle";
import { config } from "dotenv";

config();

const index = express();

index.set("view engine", "ejs");

index.use(express.static("assets"));

index.get("/", (req, res) => {
	res.render("index");
});

index.get("/results", (req, res) => {
	const q = req.query.q,
		type = req.query.type,
		page = req.query.page || 1;
	needle.get(
		`http://www.omdbapi.com/?apikey=${process.env.api_key}&s=${q}&type=${
			type == "all" ? "" : req.query.type
		}&page=${page}`,
		(err, apiRes) => {
			if (!err && apiRes.statusCode == 200) {
				const data = apiRes.body;
				if (data.Response == "True") {
					res.render("results", {
						data: data,
						srcv: { q: q, type: type, page: page },
					});
				} else {
					res.render("error", {
						error:
							"An error occured while retriving data. Please check your input and try again.",
					});
				}
			} else if (apiRes.statusCode != 200) {
				res.render("error", {
					error:
						"Error Code " +
						apiRes.statusCode +
						". An error occured while retriving data.",
				});
			} else {
				res.render("error", {
					error: "An error occured while retriving data. ERROR Details: " + err,
				});
			}
		}
	);
});

index.get("/details", (req, res) => {
	const movieID = req.query.movieID;
	needle.get(
		`http://www.omdbapi.com/?apikey=${process.env.api_key}&plot=full&i=${movieID}`,
		(err, apiRes) => {
			if (!err && apiRes.statusCode == 200) {
				const movie = apiRes.body;
				if (movie.Response == "True") {
					res.render("details", { movie: movie });
				} else {
					res.render("error", {
						error:
							"An error occured while retriving data. Please check your input and try again.",
					});
				}
			} else if (apiRes.statusCode != 200) {
				res.render("error", {
					error:
						"Error Code " +
						apiRes.statusCode +
						". An error occured while retriving data.",
				});
			} else {
				res.render("error", {
					error: "An error occured while retriving data. ERROR Details:" + err,
				});
			}
		}
	);
});

index.get("/*", (req, res) => {
	res.render("error", { error: "The page requested couldn't be found." });
});

index.listen(PORT, process.env.IP, () => {
	console.log("server initialized at port " + PORT);
});
