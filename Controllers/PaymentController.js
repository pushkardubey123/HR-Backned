const Razorpay = require("razorpay");
const crypto = require("crypto");
const Plan = require("../Modals/SuperAdmin/Plan");
const CompanySubscription = require("../Modals/SuperAdmin/CompanySubscription");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= 1. CREATE ORDER ================= */
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    // Razorpay me amount Paise (smallest unit) me dena hota hai (₹1 = 100 paise)
    const options = {
      amount: plan.price * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).json({ success: false, message: "Order creation failed" });

    res.json({ success: true, order, plan });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= 2. VERIFY PAYMENT & UPDATE DB ================= */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    const companyId = req.companyId; // Coming from auth middleware

    // 1. Create expected signature to verify authenticity
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: "Payment verification failed! Invalid Signature." });
    }

    // 2. Signature verified! Now Update Company Subscription
    const plan = await Plan.findById(planId);
    
    const newValidUpto = new Date();
    if (plan.durationDays === -1) {
      newValidUpto.setFullYear(newValidUpto.getFullYear() + 100); // Lifetime
    } else {
      newValidUpto.setDate(newValidUpto.getDate() + plan.durationDays);
    }

    await CompanySubscription.findOneAndUpdate(
      { companyId: companyId },
      {
        planId: plan._id,
        status: "active",
        validUpto: newValidUpto,
        isTrial: false
      }
    );

    res.json({ success: true, message: "Payment Successful & Subscription Updated!" });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};