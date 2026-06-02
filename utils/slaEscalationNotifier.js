const Ticket = require("../Modals/Ticket/Ticket");
const sendEmail = require("./sendEmail"); // 🔥 FIX 1: sendEmail import kiya

const checkSlaBreaches = async () => {
    try {
        const overdueTickets = await Ticket.find({
            status: { $nin: ['Resolved', 'Closed'] },
            slaDeadline: { $lt: new Date() },
            isEscalated: false
        }).populate("assigneeId", "name email");

        for (let ticket of overdueTickets) {
            ticket.isEscalated = true;
            await ticket.save();
            
            if (ticket.assigneeId && ticket.assigneeId.email) {
                const subject = `🚨 SLA Breach Alert: Ticket ${ticket.ticketId}`;
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #ef4444;">Ticket SLA Breached!</h2>
                        <p>Hello <b>${ticket.assigneeId.name}</b>,</p>
                        <p>The time limit for your assigned ticket has crossed the deadline.</p>
                        <ul>
                            <li><b>Ticket ID:</b> ${ticket.ticketId}</li>
                            <li><b>Title:</b> ${ticket.title}</li>
                            <li><b>Priority:</b> ${ticket.priority}</li>
                        </ul>
                        <p>Please resolve this issue immediately to maintain department metrics.</p>
                    </div>
                `;
                
                // 🔥 FIX 2: Comment hata kar email function call kiya
                await sendEmail(ticket.assigneeId.email, subject, emailHtml, [], "Helpdesk SLA Alert");
                console.log(`📧 SLA Breach Email Sent to: ${ticket.assigneeId.email}`);
            }
        }
    } catch (error) {
        console.error("❌ SLA Breach Check Error:", error);
    }
};

module.exports = checkSlaBreaches;