const Application = require("../Modals/Application");
const Job = require("../Modals/Job");
const CompanySubscription = require("../Modals/SuperAdmin/CompanySubscription"); // ✅ NAYA
const path = require("path");
const fs = require("fs");
const deleteFile = require("../utils/deleteFile"); // Helper agar delete logic hai

// Max size 3MB per applicant file
const MAX_APP_FILE_SIZE = 3 * 1024 * 1024; 

exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const body = { ...req.body, companyId: job.companyId, branchId: job.branchId };
    let totalIncomingBytes = 0;

    if (req.files) {
      const uploadDir = "uploads/applications";
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Calculate sizes and check limits
      for(let key of ['profileImage', 'resume', 'coverLetter']) {
         if (req.files[key]) {
            if(req.files[key].size > MAX_APP_FILE_SIZE) {
               return res.status(400).json({ success: false, message: `${key} exceeds 3MB limit.` });
            }
            totalIncomingBytes += req.files[key].size;
         }
      }

      if (req.files.profileImage) {
        const profilePath = path.join(uploadDir, Date.now() + "-" + req.files.profileImage.name);
        await req.files.profileImage.mv(profilePath);
        body.profileImage = profilePath;
      }
      if (req.files.resume) {
        const resumePath = path.join(uploadDir, Date.now() + "-" + req.files.resume.name);
        await req.files.resume.mv(resumePath);
        body.resume = resumePath;
      }
      if (req.files.coverLetter) {
        const coverPath = path.join(uploadDir, Date.now() + "-" + req.files.coverLetter.name);
        await req.files.coverLetter.mv(coverPath);
        body.coverLetter = coverPath;
      }
    }

    const application = await Application.create(body);

    // 🔥 ADD STORAGE 🔥
    if (totalIncomingBytes > 0) {
       await CompanySubscription.findOneAndUpdate(
         { companyId: job.companyId },
         { $inc: { "usage.storageUsedMB": (totalIncomingBytes / (1024 * 1024)) } }
       );
    }

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const filter = { companyId: req.companyId };
    if (req.branchId) filter.branchId = req.branchId;

    const apps = await Application.find(filter).populate("jobId", "title").sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const filter = { _id: req.params.id, companyId: req.companyId };
    if (req.branchId) filter.branchId = req.branchId;

    const application = await Application.findOne(filter).populate("jobId", "title description");
    if (!application) return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: application });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    res.json({ success: true, message: "Application rejected", application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.shortlistApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, { status: "shortlisted" }, { new: true });
    res.json({ success: true, message: "Application shortlisted", application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};