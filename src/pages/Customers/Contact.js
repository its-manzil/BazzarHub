import React, { useRef, useState } from "react";
import Nav from "./Nav";
import emailjs from "@emailjs/browser";
import { FaFacebookF, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
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
      <h1 className="contact-heading">Contact BazaarHub</h1>
      <section className="split-contact">
        <div className="contact-text">
          <h1>
            Let’s <span className="highlight">Talk!</span>
          </h1>
          <p>
            Got questions, feedback, or ideas? We're all ears at <strong>BazaarHub</strong>. Fill out the form and we’ll get back to you soon.
          </p>

          <div className="social-section">
            <p className="social-title">Follow us on social media:</p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
            <div className="map-link">
              <FaMapMarkerAlt />
              <a
                href="https://maps.google.com/?q=Kathmandu,Nepal"
                target="_blank"
                rel="noreferrer"
              >
                Visit BazaarHub
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
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

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
          {submitMessage && <p className="status-message">{submitMessage}</p>}
        </div>
      </section>
    </>
  );
};

export default Contact;
