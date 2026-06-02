const sendEmail = require("../utils/sendEmail");
const MailModel = require("../Modals/Mail");
const path = require("path");
const fs = require("fs");
const userTbl = require("../Modals/User");
const mongoose = require("mongoose");
const CompanySubscription = require("../Modals/SuperAdmin/CompanySubscription"); // ✅ NAYA IMPORT

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB per attachment

/* ================= SEND MAIL ================= */
const sendMail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    const uploadDir = path.join(__dirname, "..", "uploads", "mails");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const attachments = [];
    let storageAddedMB = 0; // 🔥 Storage tracker

    if (req.files) {
      for (let file of Object.values(req.files)) {
        // ✅ STATIC LIMIT CHECK (10MB per file)
        if (file.size > MAX_ATTACHMENT_SIZE) {
           return res.status(400).json({ success: false, message: `Attachment ${file.name} exceeds 10MB limit.` });
        }
        
        const savePath = path.join(uploadDir, file.name);
        await file.mv(savePath);
        attachments.push(file.name);
        
        // Calculate size in MB
        storageAddedMB += (file.size / (1024 * 1024));
      }
    }

    await sendEmail(
      to,
      subject,
      `<p>${message}</p>`,
      attachments.map((f) => ({
        filename: f,
        path: path.join(uploadDir, f),
      })),
      req.user.name
    );

    await MailModel.create({
      companyId: req.companyId,
      branchId: req.user.role === "admin" ? null : req.branchId,
      sender: req.user._id,
      recipients: Array.isArray(to) ? to : [to],
      subject,
      message,
      attachments,
      trashedBy: [],
      permanentlyDeletedBy: [],
    });

    // 🔥 ADD STORAGE TO DATABASE 🔥
    if (storageAddedMB > 0) {
       await CompanySubscription.findOneAndUpdate(
         { companyId: req.companyId },
         { $inc: { "usage.storageUsedMB": storageAddedMB } }
       );
    }

    res.json({ success: true, message: "Mail sent successfully" });
  } catch (err) {
    console.error("Mail send error:", err);
    res.status(500).json({ success: false, message: "Failed to send mail" });
  }
};

/* ================= SAVE DRAFT ================= */
const saveDraft = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    const uploadDir = path.join(__dirname, "..", "uploads", "mails");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const attachments = [];
    let storageAddedMB = 0; // 🔥 Storage tracker

    if (req.files) {
      for (let file of Object.values(req.files)) {
        // ✅ STATIC LIMIT CHECK
        if (file.size > MAX_ATTACHMENT_SIZE) {
           return res.status(400).json({ success: false, message: `Attachment ${file.name} exceeds 10MB limit.` });
        }

        const savePath = path.join(uploadDir, file.name);
        await file.mv(savePath);
        attachments.push(file.name);

        // Calculate size in MB
        storageAddedMB += (file.size / (1024 * 1024));
      }
    }

    await MailModel.create({
      companyId: req.companyId,
      branchId: req.user.role === "admin" ? null : req.branchId,
      sender: req.user._id,
      recipients: Array.isArray(to) ? to : [to], 
      subject,
      message,
      attachments,
      isDraft: true, 
      trashedBy: [],
      starredBy: [],
      spamBy: [],
    });

    // 🔥 ADD STORAGE TO DATABASE 🔥
    if (storageAddedMB > 0) {
       await CompanySubscription.findOneAndUpdate(
         { companyId: req.companyId },
         { $inc: { "usage.storageUsedMB": storageAddedMB } }
       );
    }

    res.json({ success: true, message: "Draft saved successfully" });
  } catch (err) {
    console.error("Save draft error:", err);
    res.status(500).json({ success: false, message: "Failed to save draft" });
  }
};

/* ================= PERMANENT DELETE (MINUS STORAGE) ================= */
const deleteMailPermanently = async (req, res) => {
  try {
    const userId = req.user._id;

    const mail = await MailModel.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!mail)
      return res.status(404).json({ success: false, message: "Mail not found" });

    // Agar sender admin/employee khud permanently delete kar raha hai (or if everyone deletes it)
    // Here we assume if it's permanently deleted, we clean up the files to save storage.
    
    let sizeToMinusMB = 0;

    // Remove files from the filesystem to free up space
    if (mail.attachments && mail.attachments.length > 0) {
       mail.attachments.forEach(fileName => {
          const filePath = path.join(__dirname, "..", "uploads", "mails", fileName);
          if (fs.existsSync(filePath)) {
             sizeToMinusMB += (fs.statSync(filePath).size / (1024 * 1024));
             fs.unlinkSync(filePath); // Actual file delete
          }
       });
    }

    // Now completely remove from DB
    await mail.deleteOne();

    // 🔥 MINUS STORAGE FROM DATABASE 🔥
    if (sizeToMinusMB > 0) {
      await CompanySubscription.findOneAndUpdate(
        { companyId: req.companyId },
        { $inc: { "usage.storageUsedMB": -sizeToMinusMB } } // Minus size
      );
    }

    res.json({ success: true, message: "Mail permanently deleted & storage freed" });
  } catch (err) {
    console.error("Permanent delete error:", err);
    res.status(500).json({ success: false, message: "Permanent delete failed" });
  }
};

/* ================= GET ALL USERS ================= */
const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const companyId = req.companyId;

    let users = [];

    if (req.user.role === "admin") {
      users = await userTbl.find({ companyId, role: "employee" }, "name email role");
    } else {
      users = await userTbl.find(
        {
          $or: [
            { _id: companyId },
            { companyId, branchId: req.branchId, role: "employee" },
          ],
        },
        "name email role"
      );
    }

    users = users.filter((u) => u._id.toString() !== loggedInUserId.toString());
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

/* ================= MOVE TO TRASH ================= */
const moveToTrash = async (req, res) => {
  try {
    const userId = req.user._id;

    const mail = await MailModel.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!mail) return res.status(404).json({ success: false, message: "Mail not found" });

    if (!mail.trashedBy.some(id => id?.toString() === userId.toString())) {
      mail.trashedBy.push(userId);
      await mail.save();
    }

    res.json({ success: true, message: "Mail moved to trash" });
  } catch (err) {
    console.error("Move to trash error:", err);
    res.status(500).json({ success: false, message: "Move to trash failed" });
  }
};

/* ================= GET TRASH ================= */
const getTrashedMails = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    const filter = {
      companyId: req.companyId,
      trashedBy: userId,
      permanentlyDeletedBy: { $ne: userId },
    };

    if (req.user.role !== "admin") {
      filter.$or = [
        { sender: userId },
        { recipients: { $in: [userEmail] } },
      ];
    }

    const mails = await MailModel.find(filter).populate("sender", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: mails });
  } catch (err) {
    console.error("Trash fetch error:", err);
    res.status(500).json({ success: false, message: "Error fetching trash" });
  }
};

/* ================= RESTORE ================= */
const restoreMail = async (req, res) => {
  try {
    const userId = req.user._id;

    const mail = await MailModel.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!mail) return res.status(404).json({ success: false, message: "Mail not found" });

    mail.trashedBy = mail.trashedBy.filter((id) => id && id.toString() !== userId.toString());
    await mail.save();

    res.json({ success: true, message: "Mail restored" });
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ success: false, message: "Restore failed" });
  }
};

/* ================= ADMIN INBOX ================= */
const getAllMails = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const adminId = req.user._id;

    const mails = await MailModel.find({
      companyId: req.companyId,
      trashedBy: { $ne: adminId },
      permanentlyDeletedBy: { $ne: adminId },
    })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: mails });
  } catch (err) {
    console.error("Admin inbox error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DOWNLOAD ================= */
const downloadAttachment = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "uploads", "mails", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }
  res.download(filePath, filename);
};

/* ================= GET DRAFTS ================= */
const getDrafts = async (req, res) => {
  try {
    const userId = req.user._id;

    const drafts = await MailModel.find({
      companyId: req.companyId,
      sender: userId,
      isDraft: true,
      trashedBy: { $ne: userId },
      permanentlyDeletedBy: { $ne: userId },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: drafts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching drafts" });
  }
};

/* ================= TOGGLE STAR (STAR/UNSTAR) ================= */
const toggleStar = async (req, res) => {
  try {
    const userId = req.user._id;
    const mail = await MailModel.findById(req.params.id);

    if (!mail) return res.status(404).json({ success: false, message: "Mail not found" });

    const index = mail.starredBy.indexOf(userId);
    if (index === -1) {
      mail.starredBy.push(userId); // Add Star
    } else {
      mail.starredBy.splice(index, 1); // Remove Star
    }

    await mail.save();
    res.json({ success: true, message: "Star updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating star" });
  }
};

/* ================= GET STARRED MAILS ================= */
const getStarredMails = async (req, res) => {
  try {
    const userId = req.user._id;

    const mails = await MailModel.find({
      companyId: req.companyId,
      starredBy: userId, 
      trashedBy: { $ne: userId },
      permanentlyDeletedBy: { $ne: userId },
    })
    .populate("sender", "name email")
    .sort({ createdAt: -1 });

    res.json({ success: true, data: mails });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching starred mails" });
  }
};

/* ================= TOGGLE SPAM (MARK/UNMARK) ================= */
const toggleSpam = async (req, res) => {
  try {
    const userId = req.user._id;
    const mail = await MailModel.findById(req.params.id);

    if (!mail) return res.status(404).json({ success: false, message: "Mail not found" });

    const index = mail.spamBy.indexOf(userId);
    if (index === -1) {
      mail.spamBy.push(userId); // Mark as Spam
    } else {
      mail.spamBy.splice(index, 1); // Unmark Spam
    }

    await mail.save();
    res.json({ success: true, message: "Spam status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating spam" });
  }
};

/* ================= GET SPAM MAILS ================= */
const getSpamMails = async (req, res) => {
  try {
    const userId = req.user._id;

    const mails = await MailModel.find({
      companyId: req.companyId,
      spamBy: userId,
      trashedBy: { $ne: userId },
      permanentlyDeletedBy: { $ne: userId },
    })
    .populate("sender", "name email")
    .sort({ createdAt: -1 });

    res.json({ success: true, data: mails });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching spam" });
  }
};

/* ================= UPDATE: MY MAILS (INBOX) ================= */
const getMyMails = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    const filter = {
      companyId: req.companyId,
      trashedBy: { $ne: userId },
      permanentlyDeletedBy: { $ne: userId },
      spamBy: { $ne: userId }, 
      isDraft: false,          
      
      $or: [
        { sender: userId },
        { recipients: { $in: [userEmail] } },
      ],
    };

    const mails = await MailModel.find(filter)
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: mails });
  } catch {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  sendMail,
  getAllMails,
  getMyMails,
  downloadAttachment,
  deleteMailPermanently,
  getTrashedMails,
  moveToTrash,
  restoreMail,
  getAllUsers,
  saveDraft,
  getDrafts,
  toggleStar,
  getStarredMails,
  toggleSpam,
  getSpamMails
};