import React, { useRef, useState } from "react";
import Nav from "./Nav";
import emailjs from "@emailjs/browser";
import "./contact.css";

const Contact = () => {
  const form = useRef();
  const [submitMessage, setSubmitMessage] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_ldwvo1p", "template_xvt0f1p", form.current, {
        publicKey: "ruc7vUP_OZXLtmGgA",
      })
      .then(
        () => {
          setSubmitMessage("✅ Thank you! Your message has been sent.");
          setTimeout(() => setSubmitMessage(""), 6000);
        },
        () => {
          setSubmitMessage("❌ Failed to send message. Please try again.");
          setTimeout(() => setSubmitMessage(""), 6000);
        }
      );
    form.current.reset();
  };

  return (
    <>
      <Nav />
      <section className="contact-section">
        <div className="contact-card">
          <h2 className="section-title">Contact BazaarHub</h2>
          <p className="section-subtitle">Feel free to reach out by filling the form below.</p>

          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <div className="input-group">
              <label htmlFor="from_name">Name</label>
              <input type="text" id="from_name" name="from_name" required />
            </div>

            <div className="input-group">
              <label htmlFor="from_email">Email</label>
              <input type="email" id="from_email" name="from_email" required />
            </div>

            <div className="input-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required />
            </div>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>

          {submitMessage && <p className="status-message">{submitMessage}</p>}
        </div>
      </section>
    </>
  );
};

export default Contact;
