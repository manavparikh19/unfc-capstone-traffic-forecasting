import { ContactForm } from "@/features/contact/contact-form";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Request a Demo",
  description:
    "Submit a validated request to book a tailored platform walkthrough for traffic intelligence, forecasting, and route planning.",
  path: "/contact",
});

export default function ContactRoute() {
  return <ContactForm />;
}
