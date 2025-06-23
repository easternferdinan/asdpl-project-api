var express = require("express");
var router = express.Router();

const db = require("../../db");
const bcrypt = require("bcrypt");

router.post("/register", async function (req, res, next) {
	try {
		const userData = req.body;

		const saltRounds = 8;
		const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

		const [existingUsersId] = await db
			.promise()
			.query(
				"SELECT `id_user` FROM `users` ORDER BY `id_user` DESC LIMIT 1"
			);

		const [existingUserEmail] = await db
			.promise()
			.query(
				"SELECT `email` FROM `users` WHERE `email` = ?",
				[userData.email]
			);

		if (existingUserEmail.length > 0) {
			res.status(500).json({
				message : "Email sudah terdaftar",
			})
			
			return;
		}

		let nextId = 1;
		if (existingUsersId.length > 0) {
			const lastId = existingUsersId[0].id_user;
			const numericPart = parseInt(lastId.replace("USR", ""));
			nextId = numericPart + 1;
		}
		const newIdUser = "USR" + String(nextId).padStart(6, "0");

		await db
			.promise()
			.query(
				"INSERT INTO `users` (`id_user`, `nama`, `email`, `telp`, `jenis_kelamin`, `kewarganegaraan`, `no_identitas`, `password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				[
					newIdUser,
					userData.nama,
					userData.email,
					userData.telp,
					userData.jenis_kelamin,
					userData.kewarganegaraan,
					userData.no_identitas,
					hashedPassword,
				]
			);

		res.status(201).json({
			message: "User registered successfully",
			id_user: newIdUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Registration failed", details: error });
	}
});

router.post("/login", async function (req, res, next) {
	try {
		const userData = req.body;
		const [userDataDb] = await db
			.promise()
			.query("SELECT * FROM `users` WHERE `email` = ?", [userData.email]);

		if (userDataDb.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(userData.password, userDataDb[0].password);

		if (!isMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		return res.status(201).json({ 
			loginStatus: "Success", 
			user: {
				id_user: userDataDb[0].id_user,
				nama: userDataDb[0].nama,
				telp: userDataDb[0].telp,
				email: userDataDb[0].email,
			}
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: "Login Failed"});
	}
});

router.post("/profile", async function (req, res, next) {
	try {
		const userData = req.body;

		const [result] = await db.promise().query("SELECT * FROM `users` WHERE `id_user` = ?", [userData.id_user]);

		if (result.length === 0) {
			return res.status(500).json({ error: "User not found"});
		}

		return res.status(201).json(result[0]);
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: "Can't retrieve user data"});
	}
});

router.post("/profile/update-profile", async function (req, res, next) {
	try {
		const {id_user, nama, telp, email} = req.body;

		const result = await db.promise().query("UPDATE `users` SET `nama` = ?, `telp` = ?, `email` = ? WHERE `id_user` = ?", 
			[nama, telp, email, id_user]);

		return res.status(201).json(result[0]);
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: "Can't update user data"});
	}
})

router.post("/profile/update-password", async function (req, res, next) {
	try {
		const saltRounds = 8;
		const hashedNewPassword = await bcrypt.hash(req.body.password, saltRounds);

		const result = await db.promise().query("UPDATE `users` SET `password` = ? WHERE `id_user` = ?", 
			[hashedNewPassword, req.body.id_user]);

		return res.status(201).json(result)
	} catch (error) {
		console.log(error);
		return res.status(500).json({error: "Can't update password"});
	}
})

module.exports = router;
