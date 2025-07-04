const prisma = require("../config/db");

exports.addNewDetails = async (req, res) => {
    try {

        const {
            full_name,
            account_number,
            bank_name,
            bank_branch,
            branch_name,
            email,
            bank_code,
            branch_code,
        } = req.body;

        const requred_fields = [
            "full_name",
            "account_number",
            "bank_name",
            "bank_branch",
            "branch_name",
            "email",
            "bank_code",
            "branch_code",
        ];

        for (const field of requred_fields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(400).json({
                    message: `${field} is requird.`
                });
            }
        }

        const detailsExists = await prisma.organizer_Details.findUnique({where: {account_number}});
        if (detailsExists) return res.status(400).json({message: "Account Number already exists"});

        const details = await prisma.organizer_Details.create(
            {
                data: {
                    full_name,
                    account_number,
                    bank_name,
                    bank_branch,
                    branch_name,
                    email,
                    bank_code,
                    branch_code,
                }
            }
        );

        return res.status(200).json({
            status: true,
            message:"success",
            data: details,
        });


    } catch (error) {
        console.error(error);
        return res.status(400).json({message: error.message});
    }
};
