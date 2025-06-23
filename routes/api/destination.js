var express = require("express");
var router = express.Router();

const db = require("../../db");

router.get("/", async function (req, res, next) {
    try {
        const [destinationData] = await db.promise().query("SELECT `id_destinasi`, `nama`, `durasi`, `kota`, `provinsi`, `harga`, `image` FROM `destinations` ORDER BY `id_destinasi`");

        return res.status(201).json({
            message: "Destination data retrieved.",
			destinationData: destinationData,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error retrieving destination data"});
    }
});

router.get("/:id_destinasi", async function (req, res, next) {
    try {
        const idDestinasi = req.params.id_destinasi
        const [destinationDetailData] = await db.promise().query("SELECT * FROM `destinations` WHERE `id_destinasi` = ?", 
            [idDestinasi]
        );

        return res.status(201).json(destinationDetailData[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error retrieving destination detail data"})
    }
});

router.post("/search", async function (req, res, next) {
    try {
        const searchKeyword = `%${req.body.searchKeyword}%`;
        console.log(req.body.searchKeyword);
        const [destinationSearchResult] = await db.promise().query("SELECT * FROM `destinations` WHERE `nama` LIKE ? OR `kota` LIKE ? OR `provinsi` LIKE ?", 
            [searchKeyword, searchKeyword, searchKeyword]
        );

        if (destinationSearchResult.length === 0) {
            return res.status(201).json({message: "No destination found."});
        }

        return res.status(201).json(destinationSearchResult);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error retrieving destination search data"})
    }
})

module.exports = router;