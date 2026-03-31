const cron = require("node-cron");
const CompanySubscription = require("../Modals/SuperAdmin/CompanySubscription");
const GlobalSetting = require("../Modals/SuperAdmin/GlobalSetting");
const sendEmail = require("./sendEmail"); // Tumhara mailer function

const checkExpiringSubscriptions = async () => {
  try {
    // 1. Get alert days from Super Admin Settings
    let setting = await GlobalSetting.findOne();
    let alertDays = setting ? setting.expiryAlertDays : 3;

    // 2. Find all active subscriptions
    const activeSubs = await CompanySubscription.find({ status: "active" })
      .populate("companyId", "name email")
      .populate("planId", "name isTrial");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let sub of activeSubs) {
      if (!sub.companyId || !sub.planId) continue;
      if (sub.planId.isTrial) continue; // Trial wale ko alg logic dena ho to yaha add kr skte ho, abhi paid k liye hai

      const validDate = new Date(sub.validUpto);
      validDate.setHours(0, 0, 0, 0);

      const diffTime = validDate.getTime() - today.getTime();
      const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const companyName = sub.companyId.name;
      const companyEmail = sub.companyId.email;

      if (daysLeft <= alertDays && daysLeft > 0) {
        // 🔥 Send Daily Countdown Email
        const subject = `⚠️ Action Required: Plan expires in ${daysLeft} days`;
        const html = `
          <h3>Hello ${companyName},</h3>
          <p>Your subscription for the <b>${sub.planId.name}</b> plan will expire in exactly <b style="color:red; font-size:18px;">${daysLeft} days</b>.</p>
          <p>Please upgrade or renew your plan before ${validDate.toDateString()} to avoid any interruption in your HRMS services.</p>
          <br/>
          <p>Regards,<br/>HareetechHR Team</p>
        `;
        await sendEmail(companyEmail, subject, html);
      } 
      else if (daysLeft <= 0) {
        // 🔥 Plan Expired Logic
        sub.status = "expired";
        await sub.save();

        const subject = `🚫 Your Subscription has Expired`;
        const html = `
          <h3>Hello ${companyName},</h3>
          <p>Your subscription for the <b>${sub.planId.name}</b> plan has officially expired.</p>
          <p>Your account access has been restricted. Please renew your plan immediately to regain access to your dashboard.</p>
          <br/>
          <p>Regards,<br/>HareetechHR Team</p>
        `;
        await sendEmail(companyEmail, subject, html);
      }
    }
  } catch (error) {
    console.error("Cron Job Error (Subscription):", error);
  }
};

module.exports = () => {
  // Roz raat 12:00 AM (midnight) par chalega
  cron.schedule("0 0 * * *", checkExpiringSubscriptions);
};