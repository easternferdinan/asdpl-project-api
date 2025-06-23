var express = require("express");
var router = express.Router();

const db = require("../../db");

router.post("/generate-transaction",async function (req, res, next) {
    try {
        const transactionData = req.body;

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");

        const tanggal_transaksi = 
            `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
            `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const insertData = [
            transactionData.id_transaksi,
            transactionData.id_user,
            transactionData.id_destinasi,
            transactionData.jumlah_tiket,
            transactionData.total_harga,
            tanggal_transaksi
        ]

        await db
			.promise()
			.query(
				"INSERT INTO `transaksi` (`id_transaksi`, `id_user`, `id_destinasi`, `jumlah_tiket`, `total_harga`, `tanggal_transaksi`) VALUES (?, ?, ?, ?, ?, ?)",
                insertData
            );

        res.status(201).json({
            status: 201,
			message: "Transaction generated successfully",
		});
    } catch (error) {
        console.log(error);
    }
})

router.post("/user-transactions", async function (req, res, next) {
    try {
        const userId = req.body.id_user

        const [transactionData] = await db
        .promise()
        .query("SELECT transaksi.*, destinations.nama, destinations.durasi, destinations.kota, destinations.provinsi, destinations.image, destinations.harga, destinations.link_group_chat, destinations.nama_group_chat, destinations.nama_tour_guide FROM `transaksi` JOIN destinations ON transaksi.id_destinasi = destinations.id_destinasi WHERE `id_user` = ?", [userId]);

        return res.status(201).json({
            status: 201,
            userTransactionData: transactionData,
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/get-details", async function (req, res, next) {
    try {
        const transactionId = req.body.id_transaksi;

        const [transactionData] = await db
			.promise()
			.query("SELECT transaksi.*, destinations.nama, destinations.durasi, destinations.kota, destinations.provinsi, destinations.image, destinations.harga, destinations.link_group_chat, destinations.nama_group_chat, destinations.nama_tour_guide, users.nama as nama_user, users.* FROM `transaksi` JOIN destinations ON transaksi.id_destinasi = destinations.id_destinasi JOIN users ON transaksi.id_user = users.id_user WHERE `id_transaksi` = ?", [transactionId]);

        return res.status(201).json({
            status: 201,
            transactionData: transactionData[0],
        });
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;