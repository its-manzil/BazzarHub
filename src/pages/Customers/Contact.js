import React, { useRef, useState } from "react";
import Nav from "./Nav";
import emailjs from "@emailjs/browser";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane
} from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import "./contact.css";
import Logo from "./Logo";
import CartLogo from "./CartLogo";

const Contact = () => {
  const form = useRef();
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    emailjs
      .sendForm("service_ldwvo1p", "template_xvt0f1p", form.current, {
        publicKey: "ruc7vUP_OZXLtmGgA",
      })
      .then(
        () => {
          setSubmitMessage("✅ Thank you! Your message has been sent successfully.");
          setTimeout(() => setSubmitMessage(""), 6000);
          setIsSubmitting(false);
        },
        () => {
          setSubmitMessage("❌ Failed to send message. Please try again later.");
          setTimeout(() => setSubmitMessage(""), 6000);
          setIsSubmitting(false);
        }
      );
    form.current.reset();
  };

  return (
    <>
      <Nav />
      <Logo/>
      <CartLogo/>
      
      {/* Hero Contact Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            Get in <span className="highlight">Touch</span> With Us
          </h1>
          <p className="contact-hero-subtitle">
            We're here to help and answer any questions you might have. 
            We look forward to hearing from you!
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="contact-main">
        <div className="contact-container">
          {/* Contact Info Section */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <h2 className="section-title">Contact <span className="highlight">Information</span></h2>
              <p className="contact-info-text">
                Fill out the form or reach out to us through these channels:
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="contact-details">
                    <h3>Our Location</h3>
                    <p>Kathmandu, Nepal</p>
                    <a 
                      href="https://maps.google.com/?q=Kathmandu,Nepal" 
                      target="_blank" 
                      rel="noreferrer"
                      className="map-link"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <FaPhoneAlt />
                  </div>
                  <div className="contact-details">
                    <h3>Phone Number</h3>
                    <p>+977 9841XXXXXX</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>
                  <div className="contact-details">
                    <h3>Email Address</h3>
                    <p>info@bazaarhub.com</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <FiClock />
                  </div>
                  <div className="contact-details">
                    <h3>Working Hours</h3>
                    <p>Sunday - Friday</p>
                    <p>9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="social-section">
                <h3 className="social-title">Follow Us On Social Media</h3>
                <div className="social-icons">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <FaLinkedin />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="contact-form-section">
            <div className="contact-form-card">
              <h2 className="section-title">Send Us a <span className="highlight">Message</span></h2>
              <form ref={form} onSubmit={sendEmail} className="contact-form">
                <div className="form-group">
                  <div className="input-group">
                    <label htmlFor="from_name">Your Name</label>
                    <input 
                      type="text" 
                      id="from_name" 
                      name="from_name" 
                      placeholder="Enter your name" 
                      required 
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="from_email">Email Address</label>
                    <input 
                      type="email" 
                      id="from_email" 
                      name="from_email" 
                      placeholder="Enter your email" 
                      required 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    placeholder="Type your message here..." 
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <FaPaperPlane className="btn-icon" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
              {submitMessage && (
                <p className={`status-message ${submitMessage.includes("✅") ? "success" : "error"}`}>
                  {submitMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <h2 className="section-title centered">Our <span className="highlight">Location</span></h2>
        <div className="map-container">
          <iframe 
            title="BazaarHub Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.456205029908!2d85.3204706155259!3d27.705202382793914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19a64b5f13e1%3A0x28b2d0eacda46b98!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp" 
            width="100%" 
            height="450" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </>
  );
};

export default Contact;