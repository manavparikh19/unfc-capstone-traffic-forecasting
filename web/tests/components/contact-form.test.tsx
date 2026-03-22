import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/features/contact/contact-form";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message:
            "Request received. Our team will reach out with a demo agenda.",
        }),
      }),
    );
  });

  it("submits a validated request and shows the success message", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
    await user.type(
      screen.getByLabelText(/organization/i),
      "City Mobility Office",
    );
    await user.type(screen.getByLabelText(/role/i), "Transportation Analyst");
    await user.type(
      screen.getByLabelText(/what do you want to evaluate/i),
      "We want to compare downtown timing changes against predicted congestion and route advice.",
    );

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/request received\. our team will reach out/i),
      ).toBeInTheDocument();
    });
  });
});
