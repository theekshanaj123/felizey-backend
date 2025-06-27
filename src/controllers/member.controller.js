const sendEmail = require("../services/emailSender");
exports.requsetSend = async (req, res) => {
    try {

        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            company,
            idNumber,
            country,
            city,
            website,
            organization,
            bankAccountNumber,
            bankAccountHolderName,
            bankName,
            bankBranch,
            imageUrl
        } = req.body;

        const requiredFields = [
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "company",
            "idNumber",
            "country",
            "city",
            "website",
            "bankAccountNumber",
            "bankAccountHolderName",
            "bankName",
            "bankBranch",
            "imageUrl"
        ];

        for(const field of requiredFields){
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
                return res.status(500).json({
                    message: `${field} is requird.`
                });
            }
        }

        const sendMail = await sendEmail(
            "kavishkachathumal276@gmail.com",
            "Membership Request",
            "request"
        );

        if (sendMail.error) {
            return res.status(400).json({ message: sendMail.message });
        }

        return res.status(200).json({
            status: true,
            message: `Membership Requested.`,
        });

    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
}
