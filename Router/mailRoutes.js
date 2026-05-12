const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { sendMail, getAllMails, getMyMails, downloadAttachment, getTrashedMails, moveToTrash, restoreMail, deleteMailPermanently, getAllUsers, saveDraft, getDrafts, toggleStar, getStarredMails, toggleSpam, getSpamMails } = require("../Controllers/sendMailController");

router.post("/send", auth, attachCompanyId, checkSubscription, sendMail);
router.get("/user", auth, attachCompanyId, checkSubscription, getAllUsers);
router.get("/", auth, attachCompanyId, checkSubscription, getAllMails);
router.get("/my-mails", auth, attachCompanyId, checkSubscription, getMyMails);

router.get("/download/:filename", downloadAttachment); // PUBLIC OR NO COMPANY ID NEEDED

router.post("/draft", auth, attachCompanyId, checkSubscription, saveDraft);
router.get("/draft", auth, attachCompanyId, checkSubscription, getDrafts);

router.get("/starred", auth, attachCompanyId, checkSubscription, getStarredMails);
router.put("/star/:id", auth, attachCompanyId, checkSubscription, toggleStar); 

router.get("/spam", auth, attachCompanyId, checkSubscription, getSpamMails);
router.put("/spam/:id", auth, attachCompanyId, checkSubscription, toggleSpam); 

router.get("/trash", auth, attachCompanyId, checkSubscription, getTrashedMails);
router.put("/trash/:id", auth, attachCompanyId, checkSubscription, moveToTrash);
router.put("/restore/:id", auth, attachCompanyId, checkSubscription, restoreMail);
router.delete("/permanent-delete/:id", auth, attachCompanyId, checkSubscription, deleteMailPermanently);

module.exports = router;
