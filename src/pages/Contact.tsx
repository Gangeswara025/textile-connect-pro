import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Inquiry Submitted",
      description: "Our team will respond to your inquiry within 24 business hours.",
    });

    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Office Address",
      details: ["Industrial Area, Sector 12", "Mumbai, Maharashtra 400001", "India"],
    },
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 98765 43210", "+91 22 2345 6789"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["business@textileb2b.com", "sales@textileb2b.com"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 9:00 AM - 1:00 PM"],
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-heading">Contact Us</h1>
          <p className="section-subheading mx-auto">
            Have questions about our fabrics or want to discuss bulk requirements? 
            Our business team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card-enterprise p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Business Inquiry Form</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="companyName" className="label-enterprise">
                      Company Name *
                    </label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPerson" className="label-enterprise">
                      Contact Person *
                    </label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="label-enterprise">
                      Business Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label-enterprise">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="label-enterprise">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is your inquiry about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="label-enterprise">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Please describe your requirements, including fabric type, quantity, and any specific specifications..."
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Inquiry
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info) => (
              <div key={info.title} className="card-enterprise p-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                    {info.details.map((detail, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Response Note */}
            <div className="bg-accent/10 rounded-lg p-5 border border-accent/20">
              <h3 className="font-semibold text-foreground mb-2">Quick Response Guaranteed</h3>
              <p className="text-sm text-muted-foreground">
                Our dedicated B2B team typically responds to all business inquiries within 24 hours during working days.
              </p>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-12">
          <div className="bg-muted/50 rounded-xl h-64 flex items-center justify-center border border-border">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Interactive map would be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
